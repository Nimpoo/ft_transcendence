"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useCookies } from "react-cookie"
import toast from "react-hot-toast"

interface Session extends User {
	api: (url: string | URL | Request, method?: "GET"|"POST"|"DELETE", body?: BodyInit) => Promise<Response>
	token: string
	friends: User[]
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

			const api = (url: string | URL | Request, method: "GET"|"POST"|"DELETE" = "GET", body?: BodyInit) => toast.promise(
				fetch(`/api${url}`, { headers: { Authorization: `Bearer ${cookies.session}` }, method, body }),
				{loading: `Fetching ${url}`, success: `${url} fetched`, error: `Unable to fetch ${url}`}
			)

			const response = await api("/users/me")

			const data = await response.json()

			if (response.status != 200) {
				toast.error(data.message)
				removeCookie("session")
				setStatus("disconnected")
				setSession(null)
			}

			else {
				const response = await api(`/users/friends/${data.id}`)
				const friends = await response.json()
				
				setSession({...data, api, token: cookies.session, friends})
				setStatus("connected")
				toast(`Hi, ${data.login}!`, {icon: "👋"})
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
