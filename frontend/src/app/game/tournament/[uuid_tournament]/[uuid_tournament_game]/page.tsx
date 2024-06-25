"use client"

import { Ubuntu } from "next/font/google"
import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"

import { useSession } from "@/providers/Session"
import { useGame } from "@/providers/Game"

import toast from "react-hot-toast"
import Canvas from "@/components/Canvas"

import "@/styles/Rainbow.css"

const ubu = Ubuntu ({
	subsets: ["latin"],
	weight: "700",
	preload: false
})

function GamingRoom(): React.JSX.Element | null {

	const [begin, setBegin] = useState<boolean>(true)
	const up = useRef<boolean>(false)
	const down = useRef<boolean>(false)

	const gameloop = useRef<NodeJS.Timeout>()

	const { session, status } = useSession()
	const { players, sendMessage, gameStatus } = useGame()

	const router = useRouter()
	const pathname = usePathname().split("/")
	const uuid = pathname[pathname.length - 1]

	useEffect(() => {
		if (status == "disconnected") {
			toast.error("You are not connected")
			router.push("/")
		}
	}, [router, status])


	useEffect(() => {
		if (gameStatus === "in-game") {
			const keypresshandler = (e: any) => {
				if (e.key === "w" || e.key === "W") {
					up.current = true
				} else if (e.key === "s" || e.key === "S") {
					down.current = true
				}
			}

			const keyunpresshandler = (e: any) => {
				if (e.key === "w" || e.key === "W") {
					up.current = false
				} else if (e.key === "s" || e.key === "S") {
					down.current = false
				}
			}

			window.addEventListener("keydown", keypresshandler)
			window.addEventListener("keyup", keyunpresshandler)

			return () => {
				window.removeEventListener("keydown", keypresshandler)
				window.removeEventListener("keydown", keyunpresshandler)
			}
		}
	}, [gameStatus])

	useEffect(() => {
		if (gameStatus === "in-game") {
			gameloop.current = setInterval(() => {
				if (up.current && !down.current)
				{
					sendMessage({
						"type": "game.paddle",
						"key": "up",
					})
				}

				else if (!up.current && down.current)
				{
					sendMessage({
						"type": "game.paddle",
						"key": "down",
					})
				}
			}, 75)

			return () => clearInterval(gameloop.current)
		}
	}, [gameStatus, session, players])

	const LetsBegin = () => {
		setBegin(false)
		if (sendMessage) {
			sendMessage({
				"type": "game.tournamentGameBegin",
				"user": session?.display_name,
				"id": session?.id.toString(),
				"game_uuid": uuid,
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
							Waiting for an opponent ...
						</h1>
					)}
				</div>
			)}
		</div>
	)
}

export default GamingRoom
