"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useCookies } from "react-cookie"
import toast from "react-hot-toast"

interface Session {
	id: number,
	nickname: string
}

interface Error {
	error: string,
	message: string
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
					"http://pong:8000/users/me/",
					{
						headers: {
							Authorization: `Bearer ${cookies.session}`
						}
					}
				),
				{
					loading: "Fetching /users/me",
					success: "/users/me fetched",
					error: "Unable to fetch /users/me"
				}
			)

			const data = await response.json()

			if (response.status != 200) {
				toast.error(data.message)
				removeCookie("session")
				setStatus("disconnected")
				setSession(null)
			}

			else {
				setStatus("connected")
				setSession(data)
				toast(`Hi, ${data.nickname}!`, {icon: "👋"})
			}

		}

		if (cookies.session) {
			handleFetch().catch(e => {
				toast.error("Something went wrong, try again.")
				setStatus("disconnected")
				setSession(null)
			})
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
