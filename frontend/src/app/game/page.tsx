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
				"user": session?.nickname,
			})
		}
	}

	const joinGame = () => {
		if (sendMessage) {
			sendMessage({
				"type": "game.join",
				"user": session?.nickname,
			})
		}
	}

	return (
		<div style={{display: "flex", justifyContent: "center"}}>

			<button onClick={joinGame} className={ "big-button-xl " + ubu.className }>
				<span className="stroke rainbow-text">JOIN A GAME</span>
			</button>

			<button onClick={createGame} className={ "big-button-xl " + ubu.className }>
				<span className="stroke rainbow-text">CREATE A ROOM</span>
			</button>

		</div>
	)
}

export default Game
