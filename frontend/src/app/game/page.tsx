"use client"

import { Ubuntu } from "next/font/google"

import { useSession } from "@/providers/Session"
import { useGame } from "@/providers/Game"

import "@/styles/Rainbow.css"

const ubu = Ubuntu ({
	subsets: ["latin"],
	weight: "700",
})

function Game(): React.JSX.Element {

	const { session } = useSession()
	const { sendMessage } = useGame()

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
