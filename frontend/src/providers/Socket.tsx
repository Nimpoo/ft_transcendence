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

				const socket = new WebSocket(`ws://${window.location.host}/api/users?token=${session.token}`)

				socket.onclose = e => {
					console.error('disconnected, retrying in 5s...')
					socket.close()
					setTimeout(connectSocket, 5000)
				}

				socket.onmessage = e => {
					console.log('from socket:', e.data)

					const sender: User = JSON.parse(e.data)['from']
					toast(t => (
						<span>
							Friend Request from {sender.display_name}

							<div className="btn-group">
								<button onClick={async () => {
									session.api("/users/friends/add", "POST", JSON.stringify({user_id: sender.id}))
									toast.dismiss(t.id)
								}}>accept</button>
								<button onClick={async () => {
									session.api("/users/friends/reject", "POST", JSON.stringify({user_id: sender.id}))
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
