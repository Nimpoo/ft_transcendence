"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useCookies } from "react-cookie"
import toast from "react-hot-toast"

interface Session {
	id: number,
	nickname: string,
}

type Status = "loading"|"connected"|"disconnected"

const SessionContext = createContext<{
	session: Session|null,
	status: Status
}>({
	session: null,
	status: "loading"
})

export function useSession() {
	return useContext(SessionContext)
}

export function SessionProvider({
	children,
}: {
	children: React.ReactNode,
}): React.JSX.Element {
	const [session, setSession] = useState<Session|null>(null)
	const [status, setStatus] = useState<Status>("loading")
	const [cookies, setCookie, removeCookie] = useCookies(["session"])

	useEffect(() => {

		const handleFetch = async () => {

			const response = await toast.promise(
				fetch(
					"/api/users/me",
					{
						headers: {
							Authorization: `Bearer ${cookies.session}`
						}
					}
				),
				{
					loading: "fetching /api/users/me",
					success: "/api/users/me fetched",
					error: "unable to fetch /api/users/me"
				}
			)

			if (response.status != 200) {
				toast.error("Invalid session token")
				removeCookie("session")
				setStatus("disconnected")
				setSession(null)
			}

			else {
				const data: Session = await response.json()
				
				setStatus("connected")
				setSession(data)
			}

		}

		if (cookies.session) {
			handleFetch()
		} else {
			setStatus("disconnected")
			setSession(null)
		}

	}, [cookies, removeCookie])

	return (
		<SessionContext.Provider value={{ session, status }}>
			{children}
		</SessionContext.Provider>
	)
}
