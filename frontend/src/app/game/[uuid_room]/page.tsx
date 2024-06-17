"use client"

import { Ubuntu } from "next/font/google"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { useSession } from "@/providers/Session"
import { useGame } from "@/providers/Game"

import toast from "react-hot-toast"
import Canvas from "@/components/Canvas"

import "@/styles/Rainbow.css"

const ubu = Ubuntu ({
	subsets: ["latin"],
	weight: "700",
})

function GamingRoom(): React.JSX.Element | null {

	const [begin, setBegin] = useState<boolean>(true)

	const { session, status } = useSession()
	const { players, sendMessage, gameStatus } = useGame()

	const router = useRouter()

	useEffect(() => {
		if (status == "disconnected") {
			toast.error("You are not connected")
			router.push("/")
		}
	}, [router, status])


	useEffect(() => {
		if (gameStatus === "in-game") {
			const keyhandler = (e: any) => {
				if (e.key === "w" || e.key === "W") {
					if (sendMessage) {
						sendMessage({
							"type": "game.paddle",
							"user": session?.display_name,
							"id": session?.id.toString(),
							"key": "up",
							"player": `${players && players[0] === session?.display_name ? "1" : "2"}`,
						})
					}
				} else if (e.key === "s" || e.key === "S") {
					if (sendMessage) {
						sendMessage({
							"type": "game.paddle",
							"user": session?.display_name,
							"id": session?.id.toString(),
							"key": "down",
							"player": `${players && players[0] === session?.display_name ? "1" : "2"}`,
						})
					}
				}
			}

			window.addEventListener("keydown", keyhandler)

			return () => {
				window.removeEventListener("keydown", keyhandler)
			}
		}
	}, [gameStatus])

	const LetsBegin = () => {
		setBegin(false)
		if (sendMessage) {
			sendMessage({
				"type": "game.begin",
				"user": session?.display_name,
				"id": session?.id.toString(),
			})
		}
	}

	useEffect(() => {
		if (!players.length) {
			router.push("/game")
			return
		}
	}, [players.length, router])

	return (
		<div style={{display: "flex", flexDirection: "column"}}>
			<div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
				<h5>{players && players.length > 0 ? players[0] : "Waiting for players ..."}</h5>
				<h5>{players && players.length > 1 ? players[1] : "Waiting for players ..."}</h5>
			</div>
			<Canvas />
			{begin && players[0] === session?.display_name && (
				<div>
					{players[1] ? (
						<button 
							onClick={LetsBegin}
							className={"big-button-xl " + ubu.className}
							style={{
								position: "absolute",
								top: "50%",
								left: "50%",
								transform: "translate(-50%, -50%)",
							}}
						>
							<span className="stroke rainbow-text">LETS BEGIN !</span>
						</button>
					) : (
						<h1
							style={{
								position: "absolute",
								top: "50%",
								left: "50%",
								transform: "translate(-50%, -50%)",
							}}
						>
							Waiting for an opponant ...
						</h1>
					)}
				</div>
			)}
		</div>
	)
}

export default GamingRoom
