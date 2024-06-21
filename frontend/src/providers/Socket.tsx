"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useSession } from "@/providers/Session"
import toast from "react-hot-toast"
import FriendRequestNotifications from "@/components/FriendRequestNotification"

const socketContext = createContext<WebSocket | undefined>(undefined)

export function useSocket() {
	return useContext(socketContext)
}

export function SocketProvider({
	children
}: {
	children: React.ReactNode
}): React.JSX.Element {
	const { session } = useSession()
	const [socket, setSocket] = useState<WebSocket>()

	useEffect(() => {
		let ws: WebSocket | undefined

		if (session) {
			const connectSocket = () => {
				ws = new WebSocket(`wss://${window.location.hostname}:8000/users/?token=${session.token}`)

				ws.onopen = function(this, event) {
					toast.success("connected")
					setSocket(this)
				}

				ws.onclose = function(this, event) {
					toast.error("disconnected")
					setSocket(undefined)
					setTimeout(connectSocket, 10000)
				}

				ws.onmessage = function(this, event) {
					let data: any

					try {
						data = JSON.parse(event.data)
					} catch (event) {
						return
					}

					const sender: User = data["from"]

					switch (data["type"]) {
						case "friendrequest.ask":
							toast(
								t => <FriendRequestNotifications sender={sender} toast={t} />,
								{ duration: 20 /* seconds */ * 1000 },
							)
							break

						case "friendrequest.accept":
							toast.success(`${sender.display_name} accepted your friend request`)
							break

						case "friendrequest.reject":
							toast.error(`${sender.display_name} rejected your friend request`)
							break

						case "friendrequest.remove":
							toast.error(`${sender.display_name} removed you from friends`)
							break

						case "message.receive":
							const msg: Chat = data["message"]
							toast(`${msg.sender.display_name}: ${msg.content}`)
							break
					}
				}
			}

			connectSocket()
		}

		return () => {
			if (ws?.readyState === WebSocket.OPEN) {
				ws.onclose = () => {}
				ws.close()
			}
		}
	}, [session])

	return (
		<socketContext.Provider value={socket}>
			{children}
		</socketContext.Provider>
	)
}
