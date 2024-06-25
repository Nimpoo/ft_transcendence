"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

import { useSession } from "@/providers/Session"

const GameContext = createContext<{
	sendMessage: (message: any) => void,
	message: any,
	gameStatus: "pending" | "in-game" | "finished",
	setGameStatus: React.Dispatch<React.SetStateAction<"pending" | "in-game" | "finished">>,
	login: string[],
	participants: string[],
	winner: string,
	play: (value: "paddle" | "wall" | "score") => void,
	ws: null | WebSocket,
}>({
	sendMessage: (message: any) => {},
	message: undefined,
	gameStatus: "pending",
	setGameStatus: () => {},
	login: [],
	participants: [],
	winner: "Nobody",
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
	const [login, setLogin] = useState<string[]>([])
	const [participants, setParticipants] = useState<string[]>([])
	const [winner, setWinner] = useState<string>("Nobody")
	const [ws, setWs] = useState<WebSocket | null>(null)
	const { session } = useSession()

	function play(value: "paddle" | "wall" | "score") {
		let audioObject:HTMLAudioElement = new Audio(`/sound/game/${value}.wav`)
		audioObject.volume = 1
		audioObject.autoplay = true
	}

	useEffect(() => {
		let ws: WebSocket | undefined;

		if (session)
		{
			const connect = () => {
				ws = new WebSocket(`wss://${window.location.hostname}:8000/game/?token=${session.token}`)

				ws.onopen = function(this, event) {
					setWs(this)
				}

				ws.onmessage = function(this, event) {
					const data = JSON.parse(event.data)

					switch (data["type"]) {
						case "game.create": {
							toast(data.message, {icon: "🍖"})
							setLogin(data.login)
							setGameStatus("pending")
							router.push(`/game/${data.room_uuid}`)
							break
						}

						case "game.join": {
							toast(data.message, {icon: "⚔️"})
							setLogin(data.login)
							setGameStatus("pending")
							router.push(`/game/${data.room_uuid}`)
							break
						}

						case "game.quit": {
							setMessage(data)
							setLogin(data.login)
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
							setWinner(data.winner)
							setMessage(data)
							break
						}

						// ! TOURNAMENT ! //
						case "game.tournament": {
							toast(data.message, {icon: "🍖"})
							setParticipants(data.login)
							setGameStatus("pending")
							router.push(`/game/tournament/${data.tournament_uuid}`)
							break
						}

						case "game.tournamentJoin": {
							toast(data.message, {icon: "⚔️"})
							setParticipants(data.login)
							setGameStatus("pending")
							router.push(`/game/tournament/${data.tournament_uuid}`)
							break
						}

						case "game.tournamentQuit": {
							setMessage(data)
							setParticipants(data.login)
							// setGameStatus("finished")
							toast(data.message, {icon: "🔨"})
							break
						}

						case "game.tournamentLaunch": {
							toast(data.message, {icon: "⚔️"})
							setLogin(data.login)
							setGameStatus("pending")
							router.push(`/game/tournament/${data.tournament_uuid}/${data.room_uuid}`)
							break
						}

						case "game.nextStep": {
							if (data["looser"]) {
								toast(data.message, {icon: "👾"})
								router.push(`/game`)
							} else {
								toast(data.message)
								setLogin(data.login)
								setParticipants(data.login)
								router.push(`/game/tournament/${data.tournament_uuid}/${data.final}`)
							}
							break
						}

						case "game.endTournament": {
							toast(data.message, {icon: "🎉"})
							setLogin([])
							setParticipants([])
							router.push(`/game`)
							break
						}
						// ! TOURNAMENT ! //

					}
				}

				ws.onclose = function(this, event) {
					setWs(null)
					setTimeout(connect, 3000)
				}
			}

			connect()
		}

		const handlePopState = () => {
			window.location.reload()
		}

		window.addEventListener("popstate", handlePopState)

		return () => {
			if (ws?.readyState === WebSocket.OPEN) {
				ws.onclose = () => {}
				ws.close()
			}
			window.removeEventListener("popstate", handlePopState)
		}
	}, [router, session])

	const sendMessage = (message: any) => {
		if (ws && ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(message))
		} else {
			console.error("[SEND MESSAGE ERROR]: Websocket isn't open.")
		}
	}

	return (
		<GameContext.Provider value={{
			login,
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
