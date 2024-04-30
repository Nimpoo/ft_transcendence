"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useGame } from "@/providers/Game"

import toast from "react-hot-toast"

function GamingRoom(): React.JSX.Element | null {

	const { players } = useGame()

	const router = useRouter()

	useEffect(() => {
		if (!players.length) {
			toast.error("DÉGAGE DE LÀ T'AS RIEN À FAIRE ICI BORDEL")
			router.push("/game")
			return
		}
	}, [players.length, router])

	return (
		<>
			<div>{players && players.length > 0 ? players[0] : "Waiting for players ..."}</div>
			<div>{players && players.length > 1 ? players[1] : "Waiting for players ..."}</div>
		</>
	)
}

export default GamingRoom
