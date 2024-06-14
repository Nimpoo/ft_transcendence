"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import toast from "react-hot-toast"

const GameContext = createContext<{
	sendMessage: (message: any) => void,
	message: any,
	gameStatus: "pending" | "in-game" | "finished",
	setGameStatus: React.Dispatch<React.SetStateAction<"pending" | "in-game" | "finished">>,
	players: string[],
	participants: string[],
	winner: string[],
	play: (value: "paddle" | "wall" | "score") => void,
	ws: null | WebSocket,
}>({
	sendMessage: (message: any) => {},
	message: undefined,
	gameStatus: "pending",
	setGameStatus: () => {},
	players: [],
	participants: [],
	winner: [],
	play: function() {},
	ws: null,
})

export function useGame() {
	return useContext(GameContext)
}

export function GameProvider({
	children,
}: {
	children: React.ReactNode,
}): React.JSX.Element {

	const router = useRouter()

	const [message, setMessage] = useState<any>()
	const [gameStatus, setGameStatus] = useState<"pending" | "in-game" | "finished">("pending")
	const [players, setPlayers] = useState<string[]>([])
	const [participants, setParticipants] = useState<string[]>([])
	const [winner, setWinner] = useState<string[]>(["display_name", "id"])
	const [ws, setWs] = useState<WebSocket | null>(null)

	function play(value: "paddle" | "wall" | "score") {
		let audioObject:HTMLAudioElement = new Audio(`/sound/game/${value}.wav`)
		audioObject.volume = 1
		audioObject.autoplay = true
	}

	useEffect(() => {
		const ws = new WebSocket(`wss://${window.location.hostname}:8000/game/`)

		ws.onopen = (event: Event) => {
			console.log("Connected to Pong ✅")
		}

		ws.onmessage = (event: any) => {
			const data = JSON.parse(event.data)
			if (data["type"] !== "game.update") {
				console.log(data)
			}

			switch (data["type"]) {
				case "game.create": {
					toast(data.message, {icon: "🍖"})
					setPlayers(data.players)
					setGameStatus("pending")
					router.push(`/game/${data.room_uuid}`)
					break
				}

				case "game.join": {
					toast(data.message, {icon: "⚔️"})
					setPlayers(data.players)
					setGameStatus("pending")
					router.push(`/game/${data.room_uuid}`)
					break
				}

				case "game.quit": {
					setMessage(data)
					setPlayers(data.players)
					setGameStatus("finished")
					toast(data.message, {icon: "🔨"})
					break
				}

				case "game.null": {
					toast(data.message, {icon: "🍊"})
					break
				}

				case "game.update": {
					setMessage(data)
					if (gameStatus !== "in-game") {
						setGameStatus("in-game")
					}
					if (data.new_position.sound) {
						play(data.new_position.sound)
					}
					break
				}

				case "game.point": {
					setMessage(data)
					break
				}

				case "game.countdown": {
					setMessage(data)
					break
				}

				case "game.finished": {
					setGameStatus("finished")
					setWinner([data.winner, data.id])
					setMessage(data)
					break
				}

				// ! TOURNAMENT ! //
				case "game.tournament": {
					toast(data.message, {icon: "🍖"})
					setParticipants(data.participants)
					setGameStatus("pending")
					router.push(`/game/tournament/${data.tournament_uuid}`)
					break
				}

				case "game.tournamentJoin": {
					toast(data.message, {icon: "⚔️"})
					setParticipants(data.participants)
					setGameStatus("pending")
					router.push(`/game/tournament/${data.tournament_uuid}`)
					break
				}

				case "game.tournamentQuit": {
					setMessage(data)
					setParticipants(data.participants)
					// setGameStatus("finished")
					toast(data.message, {icon: "🔨"})
					router.push("/game")
					break
				}

				case "game.tournamentLaunch": {
					toast(data.message, {icon: "⚔️"})
					setPlayers(data.players)
					setGameStatus("pending")
					router.push(`/game/tournament/${data.tournament_uuid}/${data.room_uuid}`)
					break
				}

				case "game.nextStep": {
					if (data["looser"]) {
						toast(data.message, {icon: "🫵"})
						router.push(`/game`)
					} else {
						toast(data.message)
						setPlayers(data.players)
						setParticipants(data.participants)
						router.push(`/game/tournament/${data.tournament_uuid}/${data.final}`)
					}
					break
				}

				case "game.endTournament": {
					console.log("LE TOURNOI IL EST FINI !")
					toast(data.message, {icon: "🎉"})
					setPlayers([])
					setParticipants([])
					router.push("/game")
					break
				}
				// ! TOURNAMENT ! //

			}
		}

		ws.onerror = (event: Event) => {
			console.error("[WEBSOCKET ERROR]: ", event)
		}

		setWs(ws)

		return () => {
			ws.close()
		}
	}, [router])

	const sendMessage = (message: any) => {
		if (ws && ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(message))
		} else {
			console.error("[SEND MESSAGE ERROR]: Websocket isn't open.")
		}
	}

	return (
		<GameContext.Provider value={{
			players,
			sendMessage,
			message,
			gameStatus,
			setGameStatus,
			winner,
			participants,
			play,
			ws,
		}}>
			{children}
		</GameContext.Provider>
	)
}
