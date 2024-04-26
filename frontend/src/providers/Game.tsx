"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import toast from "react-hot-toast"

type Status = "loading" | "conected" | "disconnected"

const GameContext = createContext<{
	status: Status
	sendMessage?: (message: any) => void
}>({
	status: "loading"
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

	const [status, setStatus] = useState<Status>("loading")
	const [ws, setWs] = useState<WebSocket | null>(null)

	useEffect(() => {
		const ws = new WebSocket(`ws://${window.location.hostname}:8000/ws/game/`)

		ws.onopen = function(event: Event) {
			setStatus("conected")
		}

		ws.onmessage = function(event: MessageEvent<any>) {
			const data = JSON.parse(event.data)
			if (data["type"] === "game.create") {
				toast(data.message, {icon: "🍖"})
				router.push(`/game/${data.room_uuid}`)
			}

			else if (data["type"] === "game.join") {
				toast(data.message, {icon: "⚔️"})
				router.push(`/game/${data.room_uuid}`)
			}

			else if (data["type"] === "game.null") {
				toast(data.message, {icon: "🍊"})
			}
		}

		ws.onerror = function(event: Event) {
			console.error("[WEBSOCKET ERROR]: ", event)
		}

		ws.onclose = function(event: CloseEvent) {
			setStatus("disconnected")
			ws.close()
		}

		setWs(ws)

		return () => {
			ws.close()
		}
	}, [])

	const sendMessage = (message: any) => {
		if (ws && ws?.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(message))
		} else {
			console.error("Websocket isn't open.")
		}
	}

	return (
		<GameContext.Provider value={{ status, sendMessage }}>
			{children}
		</GameContext.Provider>
	)
}
