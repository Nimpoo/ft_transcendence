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
}>({
	sendMessage: (message: any) => {},
	message: undefined,
	gameStatus: "pending",
	setGameStatus: () => {},
	players: [],
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

	const [players, setPlayers] = useState<string[]>([])
	const [ws, setWs] = useState<WebSocket | null>(null)
	const [message, setMessage] = useState<any>()
	const [gameStatus, setGameStatus] = useState<"pending" | "in-game" | "finished">("pending")

	useEffect(() => {
		const ws = new WebSocket(`ws://${window.location.hostname}:8000/ws/game/`)

		ws.onopen = (event: Event) => {
			console.log("Websocket Open ✅")
		}

		ws.onmessage = (event: any) => {
			const data = JSON.parse(event.data)
			// console.log("[PROVIDER GAMESTATUS]:	{", gameStatus, "}\n[TYPE]:					{", data["type"], "}")

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
					break
				}
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
		<GameContext.Provider value={{ players, sendMessage, message, gameStatus, setGameStatus }}>
			{children}
		</GameContext.Provider>
	)
}
