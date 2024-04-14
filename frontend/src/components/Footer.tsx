"use client"

import Image from "next/image"
import Link from "next/link"
import toast from "react-hot-toast"
import { redirect } from "next/navigation"
import { useCookies } from "react-cookie"
import { useEffect, useState } from "react"
import { useQRCode } from "next-qrcode"

import { useSession } from "@/providers/Session"
import { useSocket } from "@/providers/Socket"
import { useModal } from "@/providers/Modal"

import "@/styles/components/Footer/Footer.css"
import "@/styles/components/Footer/Settings.css"


function Settings(): React.JSX.Element {
	const { session } = useSession()
	const socket = useSocket()
	const { clearModal } = useModal()
	const { Canvas } = useQRCode()
	const [cookies, setCookie, removeCookie] = useCookies(["session", "settings"])

	const isSoundOn = cookies.settings & 1 ? true : false
	const isDarkModeOn = cookies.settings >> 1 & 1 ? true : false

	const [dfaSecret, setDfaSecret] = useState(session?.dfa_secret)
	const is2faOn = session?.dfa_secret ? true : false

	return (
		<div className="modal-wrapper">
			<h2 className="mb-3">Settings</h2>

			<div className="d-flex justify-content-between align-items-center mb-3">
				<div>
					<Image className="modal-icon"
						src="/assets/svg/volume-setting.svg"
						width={30}
						height={30}
						alt="sound logo"
					/>
					<span className="ms-2">Sound</span>
				</div>
				<div className="btn-group" role="group">
					<input type="radio" onChange={() => setCookie("settings", cookies.settings | 1, {sameSite: true})}
						className="btn-check" name="setting-sound" id="setting-sound-on" hidden checked={isSoundOn} />
					<label className="btn btn-outline-success" htmlFor="setting-sound-on">ON</label>
					<input type="radio" onChange={() => setCookie("settings", cookies.settings & ~1, {sameSite: true})}
						className="btn-check" name="setting-sound" id="setting-sound-off" hidden checked={!isSoundOn} />
					<label className="btn btn-outline-danger" htmlFor="setting-sound-off">OFF</label>
				</div>
			</div>

			<div className="d-flex justify-content-between align-items-center mb-3">
				<div>
					<Image className="modal-icon"
						src="/assets/svg/dark-mode-setting.svg"
						width={30}
						height={30}
						alt="dark-mode logo"
					/>
					<span className="ms-2">Dark Mode</span>
				</div>
				<div className="btn-group" role="group">
					<input type="radio" onChange={() => setCookie("settings", cookies.settings | 2, {sameSite: true})}
						className="btn-check" name="setting-dark-mode" id="setting-dark-mode-on" hidden checked={isDarkModeOn} />
					<label className="btn btn-outline-success" htmlFor="setting-dark-mode-on">ON</label>
					<input type="radio" onChange={() => setCookie("settings", cookies.settings & ~2, {sameSite: true})}
						className="btn-check" name="setting-dark-mode" id="setting-dark-mode-off" hidden checked={!isDarkModeOn} />
					<label className="btn btn-outline-danger" htmlFor="setting-dark-mode-off">OFF</label>
				</div>
			</div>

			{session && (
				<>
					<div className="d-flex justify-content-between align-items-center mb-3">
						<div>
							<Image className="modal-icon"
								src="/assets/svg/2fa-setting.svg"
								width={30}
								height={30}
								alt="2fa logo"
							/>
							<span className="ms-2">Two-factor Authenticator</span> 
						</div>
						<div className="btn-group" role="group">
							<input type="radio" onChange={async e => {
								e.target.disabled = true
								const response = await session.api("/users/dfa/", "POST")
								if (response.status === 200) {
									const data = await response.json().catch(e => console.error(e.message))
									if (data && data["dfa_secret"])
										session.dfa_secret = data["dfa_secret"]
										setDfaSecret(session.dfa_secret)
								}
								e.target.disabled = false
							}}
								className="btn-check" name="setting-2fa" id="setting-2fa-on" hidden disabled={socket?.readyState !== WebSocket.OPEN} checked={is2faOn} />
							<label className="btn btn-outline-success" htmlFor="setting-2fa-on">ON</label>
							<input type="radio" onChange={async e => {
								e.target.disabled = true
								const response = await session.api("/users/dfa/", "DELETE")
								if (response.status === 200)
								session.dfa_secret = null
									setDfaSecret(session.dfa_secret)
								e.target.disabled = false
							}}
								className="btn-check" name="setting-2fa" id="setting-2fa-off" hidden disabled={socket?.readyState !== WebSocket.OPEN} checked={!is2faOn} />
							<label className="btn btn-outline-danger" htmlFor="setting-2fa-off">OFF</label>
						</div>
					</div>

					{is2faOn &&
						<>
							<Canvas
								text={`otpauth://totp/ft_transcendence:${session.login}?secret=${dfaSecret}&issuer=ft_transcendence`}
								options={{
									errorCorrectionLevel: "M",
									margin: 3,
									scale: 4,
									width: 200,
									color: {
										dark: "#0000",
										light: "#FFF",
									},
								}}
							/>
							<span className="d-inline-block" tabIndex={0} data-bs-toggle="popover" data-bs-trigger="hover focus" data-bs-content={dfaSecret}>
								setup key: <code className="badge text-bg-secondary">{dfaSecret}</code>
							</span>
						</>
					}

					<div className="d-flex justify-content-between align-items-center mb-3">
						<div>
							<Image className="modal-icon"
								src="/assets/svg/display-name-setting.svg"
								width={30}
								height={30}
								alt="display name logo"
							/>
							<span className="ms-2">Display Name</span>
						</div>
						<form onSubmit={e => {
							e.preventDefault()

							const form = e.target as HTMLFormElement
							const display_name_input = form.display_name
							
							if (display_name_input && !display_name_input.classList.contains("invalid")) {
								const display_name = display_name_input.value
								session.api("/users/me/", "POST", JSON.stringify({display_name}))
									.then(response => response.json())
									.then(console.log)
									.catch(console.error)
							}
						}}>
							<input type="text" name="display_name" id="display_name" defaultValue={session.display_name} onChange={e => {
								const value = e.target.value
								if (4 <= value.length && value.length <= 30) {
									e.target.classList.remove("invalid")
								} else {
									e.target.classList.add("invalid")
								}
							}} />
							<input type="submit" value="set" disabled={socket?.readyState !== WebSocket.OPEN} />
						</form>
					</div>

					<div className="justify-content-center d-flex align-items-center">
						<button type="button" className="btn btn-danger"
							onClick={
								() => {
									removeCookie("session", {sameSite: true})
									clearModal()
									toast("See you soon", {icon:"👋"})

									if (isSoundOn) {
										let audioObject: HTMLAudioElement = new Audio("/assets/sounds/mario.wav")
										audioObject.volume = 0.3
										audioObject.autoplay = true
									}

									redirect("/")
								}
							}
						>Log out</button>
					</div>
				</>
			)}

		</div>

	)
}

function Footer(): React.JSX.Element {
	const { session, status } = useSession()
	const { createModal } = useModal()
	const [cookies, setCookie] = useCookies(["settings"])

	useEffect(() => {
		if (cookies.settings === undefined) {
			setCookie("settings", 0b11, {sameSite: true})
		}
	}, [cookies, setCookie])

	const settingsModal = <Settings />

	if (status === "loading") {
		return <></> // todo loading
	}

	return (
		<footer className="mt-auto footer-wrapper">
			{session &&
				<Link className="link-light" href="/chat">
					<button className="btn shadow-none">
						<Image className="image"
							src="/assets/svg/chat.svg"
							width={30}
							height={30}
							alt="Chat logo"
						/>
						Chat
					</button>
				</Link>
			}

			<button className="btn shadow-none" onClick={() => createModal(settingsModal)}>
				<Image className="image"
					src="/assets/svg/settings.svg"
					width={30}
					height={30}
					alt="Settings logo"
				/>
				Settings
			</button>
		</footer>
	)
}

export default Footer
