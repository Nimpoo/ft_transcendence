"use client"

import { Ubuntu } from "next/font/google"

import { useEffect } from "react"
import { useSession } from "@/providers/Session"
import { useGame } from "@/providers/Game"
import { useRouter } from "next/navigation"

import "@/styles/Rainbow.css"
import toast from "react-hot-toast"

const ubu = Ubuntu ({
	subsets: ["latin"],
	weight: "700",
})

function Game(): React.JSX.Element {

	const router = useRouter()

	const { session, status } = useSession()
	const { sendMessage } = useGame()

	useEffect(() => {
		if (status == "disconnected") {
			toast.error("You are not connected")
			router.push("/")
		}
	}, [router, status])

	const createGame = () => {
		if (sendMessage) {
			sendMessage({
				"type": "game.create",
				"user": session?.display_name,
				"id": session?.id.toString(),
			})
		}
	}

	const joinGame = () => {
		if (sendMessage) {
			sendMessage({
				"type": "game.join",
				"user": session?.display_name,
				"id": session?.id.toString(),
			})
		}
	}

	return (
		<div className="mt-auto">
			<div style={{display: "flex", justifyContent: "center"}}>
				<button onClick={joinGame} className={ `margin-btn big-button-xl ${ubu.className}` }>
					<span className="stroke rainbow-text">JOIN A GAME</span>
				</button>

				<button onClick={createGame} className={ `big-button-xl ${ubu.className}` }>
					<span className="stroke rainbow-text">CREATE A ROOM</span>
				</button>
			</div>
			<div className="mt-3" style={{display: "flex", justifyContent: "center"}}>
				<button className={ `big-button-xl ${ubu.className}` }>
					<span className="stroke rainbow-text text-break">TORNAMENT</span>
				</button>
			</div>
		</div>
	)
}

export default Game
