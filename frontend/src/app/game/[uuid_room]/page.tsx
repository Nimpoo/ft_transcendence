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

	const { session } = useSession()
	const { players, sendMessage } = useGame()

	const router = useRouter()

	const LetsBegin = () => {
		setBegin(false)
		if (sendMessage) {
			sendMessage({
				"type": "game.begin",
				"user": session?.nickname,
			})
		}
	}

	useEffect(() => {
		if (!players.length) {
			toast.error("DÉGAGE DE LÀ TAS RIEN À FAIRE ICI BORDEL")
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
			{begin && players[0] === session?.nickname && (
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
