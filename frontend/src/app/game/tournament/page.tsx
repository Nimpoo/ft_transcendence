"use client"

import { Ubuntu } from "next/font/google"

import { useEffect } from "react"
import { useSession } from "@/providers/Session"
import { useGame } from "@/providers/Game"
import { useRouter } from "next/navigation"

import "@/styles/Rainbow.css"
import toast from "react-hot-toast"
import Loading from "@/app/loading"

const ubu = Ubuntu ({
	subsets: ["latin"],
	weight: "700",
})

function Game(): React.JSX.Element {

	const router = useRouter()

	const { session, status } = useSession()
	const { sendMessage, ws } = useGame()

	useEffect(() => {
		if (status == "disconnected") {
			toast.error("You are not connected")
			router.push("/")
		}
	}, [router, status])

	const createTournament = () => {
		if (sendMessage) {
			sendMessage({
				"type": "game.tournament",
				"user": session?.display_name,
				"id": session?.id.toString(),
				"limit": 4,
			})
		}
	}

	const joinTournament = () => {
		if (sendMessage) {
			sendMessage({
				"type": "game.tournamentJoin",
				"user": session?.display_name,
				"id": session?.id.toString(),
			})
		}
	}

	if (ws === null) {
		return <Loading />
	}
	return (
		<div className="mt-auto">
			<div style={{display: "flex", justifyContent: "center"}}>
				<button onClick={joinTournament} className={ `big-button-xl ${ubu.className}` }>
					<span className="stroke rainbow-text">JOIN TOURNAMENT</span>
				</button>
			</div>
			<div className="mt-3" style={{display: "flex", justifyContent: "center"}}>
				<button onClick={createTournament} className={ `big-button-xl ${ubu.className}` }>
					<span className="stroke rainbow-text text-break">CREATE TOURNAMENT</span>
				</button>
			</div>
		</div>
	)
}

export default Game
