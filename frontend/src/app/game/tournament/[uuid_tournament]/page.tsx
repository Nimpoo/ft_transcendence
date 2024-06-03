"use client"

import { Ubuntu } from "next/font/google"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { useSession } from "@/providers/Session"
import { useGame } from "@/providers/Game"

import toast from "react-hot-toast"

import "@/styles/Rainbow.css"
import "@/styles/global.css"
import "@/styles/Tournament.css"

const ubu = Ubuntu ({
	subsets: ["latin"],
	weight: "700",
})

function TournamentRoom(): React.JSX.Element | null {

	const { status } = useSession()
	const { participants } = useGame()

	const router = useRouter()

	useEffect(() => {
		if (status == "disconnected") {
			toast.error("You are not connected")
			router.push("/")
		}
	}, [router, status])

	useEffect(() => {
		if (!participants.length) {
			toast.error("Unauthorized access to this tournament.")
			router.push("/game")
			return
		}
	}, [participants.length, router])

	return (
		<div className="mt-auto">
			<div style={{display: "flex", justifyContent: "center"}}>
				<span className={ `stroke tournament-title ${ubu.className}` }>TOURNAMENT</span>
			</div>
			{participants && (
				<div className="bracket">
					<div className="round-left">
						<div className="participant-top">
							{participants[0]
								? <h1 className="font-color">{participants[0]}</h1>
								: <h1 className="font-color">0 Waiting for a participant ...</h1>
							} 
						</div>
						<div className="participant">
							{participants[1]
								? <h1 className="font-color">{participants[1]}</h1>
								: <h1 className="font-color">1 Waiting for a participant ...</h1>
							}
						</div>
					</div>
					<div className="lines-bracket-left"></div>
					<div className="lines-bracket-middle"></div>
					<div className="lines-bracket-right"></div>
					<div className="round-right">
						<div className="participant-top">
							{participants[2]
								? <h1 className="font-color">{participants[2]}</h1>
								: <h1 className="font-color">2 Waiting for a participant ...</h1>
							} 
						</div>
						<div className="participant">
							{participants[3]
								? <h1 className="font-color">{participants[3]}</h1>
								: <h1 className="font-color">3 Waiting for a participant ...</h1>
							}
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default TournamentRoom
