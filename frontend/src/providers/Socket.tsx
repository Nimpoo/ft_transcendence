"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useSession } from "@/providers/Session"
import toast from "react-hot-toast"

const socketContext = createContext<WebSocket|null>(null)

export function useSocket() {
	return useContext(socketContext)
}

export function SocketProvider({
	children
}: {
	children: React.ReactNode
}): React.JSX.Element {
	const { session } = useSession()
	const [socket, setSocket] = useState<WebSocket|null>(null)

	useEffect(() => {
		if (session) {
			const connectSocket = () => {
				console.log('Attempting to connect...')

				const socket = new WebSocket(`ws://${window.location.hostname}:8000/users/?token=${session.token}`)

				socket.onclose = e => {
					console.error('disconnected, retrying in 5s...')
					socket.close()
					setTimeout(connectSocket, 5000)
				}

				socket.onmessage = e => {
					let data

					try {
						data = JSON.parse(e.data)
					} catch (e) {
						return
					}

					const sender: User = data['from']

					switch (data["type"]) {
						case "friendrequest.ask":
							toast(t => (
								<span>
									Friend Request from {sender.display_name}

									<div className="btn-group">
										<button onClick={async () => {
											session.api("/users/friends", "POST", JSON.stringify({user_id: sender.id}))
											toast.dismiss(t.id)
										}}>accept</button>
										<button onClick={async () => {
											session.api("/users/friends", "DELETE", JSON.stringify({user_id: sender.id}))
											toast.dismiss(t.id)
										}}>reject</button>
									</div>

									<button onClick={() => toast.dismiss(t.id)}>
										X
									</button>

								</span>
							), {
								duration: 20000
							})
							break

						case "friendrequest.accept":
							toast(`${sender.display_name} accepted your friend request`)
							break

						case "friendrequest.reject":
							toast(`${sender.display_name} rejected your friend request`)
							break

						case "friendrequest.remove":
							toast(`${sender.display_name} removed you from friends`)
							break

						case "message.receive":
							toast(`${sender.display_name}: ${data["content"]}`)
							break
					}
				}

				socket.onopen = e => {
					console.info('connected')
					setSocket(socket)
				}
			}

			connectSocket()
		}
	}, [session])

	return (
		<socketContext.Provider value={socket}>
			{children}
		</socketContext.Provider>
	)
}
