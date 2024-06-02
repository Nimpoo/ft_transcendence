"use client"

import { Ubuntu } from "next/font/google"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { useSession } from "@/providers/Session"
import { useGame } from "@/providers/Game"

import toast from "react-hot-toast"

import "@/styles/Rainbow.css"

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
		<>
			{participants && (
				<div>
					{participants[0]
						? <h1>{participants[0]}</h1>
						: <h1>Waiting for a participant ...</h1>
					} {participants[1]
						? <h1>{participants[1]}</h1>
						: <h1>Waiting for a participant ...</h1>
					} {participants[2]
						? <h1>{participants[2]}</h1>
						: <h1>Waiting for a participant ...</h1>
					} {participants[3]
						? <h1>{participants[3]}</h1>
						: <h1>Waiting for a participant ...</h1>
					}
				</div>
			)}
		</>
	)
}

export default TournamentRoom
