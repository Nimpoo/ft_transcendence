"use client"

import Image from "next/image"
import Link from "next/link"
import toast from "react-hot-toast"
import { usePathname, useRouter } from "next/navigation"
import { useCookies } from "react-cookie"
import { useEffect, useState } from "react"
import { useQRCode } from "next-qrcode"

import { useSession } from "@/providers/Session"
import { useSocket } from "@/providers/Socket"
import { useModal } from "@/providers/Modal"

import "@/styles/components/Footer/Footer.css"
import "@/styles/components/Footer/Settings.css"
import BlockedUsersList from "@/components/BlockedUsersList"


function Settings(): React.JSX.Element {
	const { session, setSession } = useSession()
	const socket = useSocket()
	const { createModal, clearModal } = useModal()
	const { Canvas } = useQRCode()
	const [cookies, setCookie, removeCookie] = useCookies(["session", "settings"])
	const [dfaSecret, setDfaSecret] = useState<string|null>(null)
	const router = useRouter()

	const isSoundOn: boolean = (cookies.settings & 1) != 0
	const isDarkModeOn: boolean = (cookies.settings >> 1 & 1) != 0

	useEffect(() => {
		if (session) {
			session.api("/users/dfa/")
				.then(response => response.json())
				.then((data: any) => {
					if (data["dfa_secret"]) {
						setDfaSecret(data["dfa_secret"])
					}
				})
		}
	}, [session])

	return (
		<div className="modal-wrapper">
			<h2 className="text-title-settings">Settings</h2>

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
					<input type="radio" onChange={() => setCookie("settings", cookies.settings | 1, {sameSite: "none", secure: true})}
						className="btn-check" name="setting-sound" id="setting-sound-on" hidden checked={isSoundOn} />
					<label className="btn btn-outline-success" htmlFor="setting-sound-on">ON</label>
					<input type="radio" onChange={() => setCookie("settings", cookies.settings & ~1, {sameSite: "none", secure: true})}
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
					<input type="radio" onChange={() => setCookie("settings", cookies.settings | 2, {sameSite: "none", secure: true})}
						className="btn-check" name="setting-dark-mode" id="setting-dark-mode-on" hidden checked={isDarkModeOn} />
					<label className="btn btn-outline-success" htmlFor="setting-dark-mode-on">ON</label>
					<input type="radio" onChange={() => setCookie("settings", cookies.settings & ~2, {sameSite: "none", secure: true})}
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
								className="btn-check" name="setting-2fa" id="setting-2fa-on" hidden disabled={socket?.readyState !== WebSocket.OPEN} checked={dfaSecret !== null} />
							<label className="btn btn-outline-success" htmlFor="setting-2fa-on">ON</label>
							<input type="radio" onChange={async e => {
								e.target.disabled = true
								const response = await session.api("/users/dfa/", "DELETE")
								if (response.status === 200)
								session.dfa_secret = null
									setDfaSecret(session.dfa_secret)
								e.target.disabled = false
							}}
								className="btn-check" name="setting-2fa" id="setting-2fa-off" hidden disabled={socket?.readyState !== WebSocket.OPEN} checked={dfaSecret === null} />
							<label className="btn btn-outline-danger" htmlFor="setting-2fa-off">OFF</label>
						</div>
					</div>

					{dfaSecret &&
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

					<div
						className="d-flex justify-content-between align-items-center mb-3"
						id="blocked-users-link"
						onClick={() => createModal(<BlockedUsersList />, 500, 400)}
					>
						<span className="ms-2">Blocked users</span>
						<Image
							className="modal-icon"
							src="/assets/svg/arrow-forward-outline.svg"
							width={30}
							height={30}
							alt="link-right-direction logo"
						/>
					</div>

					<form
						onSubmit={
							function (e) {
								e.preventDefault()

								const form = e.target as HTMLFormElement
								let formData = new FormData()

								const display_name_input = form.display_name
								if ((4 > display_name_input.value.lenght || display_name_input.value.lenght > 30) || display_name_input.classList.contains("invalid"))
								{
									toast.error("invalid display name")
									return
								}
								formData.append("display_name", display_name_input.value)

								const avatar_input = form.avatar
								if (avatar_input.value) {
									const fileName = avatar_input.files[0].name;
									const ext = fileName.substring(fileName.lastIndexOf('.'));
									if (ext == '.jpg' || ext == '.jpeg' || ext == '.png')
										formData.append("avatar", avatar_input.files[0])
									else
										toast.error('Accepted formats are : jpg, jpeg, png')
										return
								}

								session.api("/users/me/", "POST", formData)
									.then(response => response.json())
									.then(data => {
										if ((data["display_name"] == session.display_name) && (display_name_input.value != session.display_name)) {
											toast.error("This display name is already taken")
										}
										if (setSession) {
											setSession({...session, ...data})
										}
									})
									.catch(console.error)
							}
						}
					>

					<div className="d-flex justify-content-between align-items-center mb-3">
							<div>
								<Image
									className="modal-icon"
									src="/assets/svg/display-name-setting.svg"
									width={30}
									height={30}
									alt="display name logo"
								/>
								<span className="ms-2">Display Name</span>
							</div>
								<input
									className="put-your-name-there"
									type="text"
									name="display_name"
									defaultValue={session.display_name}
									onChange={
										function (e) {
											const value = e.target.value
											if (4 <= value.length && value.length <= 30) {
												e.target.classList.remove("invalid")
											} else {
												e.target.classList.add("invalid")
											}
										}
									}
								/>
						</div>

						<div className="d-flex justify-content-between align-items-center mb-3">
							<div>
								<Image
									className="modal-icon"
									src="/assets/svg/avatar-setting.svg"
									width={30}
									height={30}
									alt="avatar logo"
								/>
								<span className="ms-2">Avatar</span>
							</div>
								<input
									className="put-your-new-avatar-there"
									type="file"
									name="avatar"
								/>
						</div>
						<div className="justify-content-evenly d-flex align-items-center">
							<input className="btn btn-success" type="submit" value="Save changes" disabled={socket?.readyState !== WebSocket.OPEN} />
							<button type="button" className="btn btn-danger"
								onClick={
									() => {
										removeCookie("session", {sameSite: "strict", secure: true})
										clearModal()
										toast("See you soon", {icon:"👋"})

										if (isSoundOn) {
											let audioObject: HTMLAudioElement = new Audio("/assets/sounds/mario.wav")
											audioObject.volume = 0.3
											audioObject.autoplay = true
										}

										router.push("/")
									}
								}
							>Log out</button>
						</div>

					</form>

				</>
			)}

		</div>

	)
}

function Footer(): React.JSX.Element {
	const { session, status } = useSession()
	const { createModal } = useModal()
	const [cookies, setCookie] = useCookies(["settings"])

	const pathname = usePathname()

	useEffect(() => {
		if (cookies.settings === undefined) {
			setCookie("settings", 0b11, {sameSite: "none", secure: true})
		}
	}, [cookies, setCookie])

	const settingsModal = <Settings />

	if (status === "loading") {
		return <></> // todo loading
	} else if (pathname.includes("game")) {
		return (
			<></>
		)
	} else {
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
}

export default Footer
