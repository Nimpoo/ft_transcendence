"use client"

import { Dispatch, SetStateAction, createContext, useContext, useEffect, useState } from "react"
import { useCookies } from "react-cookie"
import toast from "react-hot-toast"


interface Session extends User { // token undefied when setSession
	api: (url: string | URL | Request, method?: "GET"|"POST"|"DELETE", body?: BodyInit) => Promise<Response>
	token: string
	dfa_secret: string | null
}

type Status = "loading"|"connected"|"disconnected"

const SessionContext = createContext<{
	session: Session|null,
	status: Status,
	setSession: Dispatch<SetStateAction<Session | null>>|null
}>({
	session: null,
	status: "loading",
	setSession: null
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
		if (cookies.session) {
			const handleFetch = async () => {
				const api = (url: string | URL | Request, method: "GET"|"POST"|"DELETE" = "GET", body?: BodyInit) => toast.promise(
					fetch(`https://${window.location.hostname}:8000${url}`, { headers: { Authorization: `Bearer ${cookies.session}` }, method, body }),
					{loading: `Fetching ${url}`, success: `${url} fetched`, error: `Unable to fetch ${url}`}
				)

				const response = await api("/users/me/")

				if (response.status != 200) {
					throw new Error(`/users/me returned ${response.status}`)
				}

				else {
					const data = await response.json()
					setSession({...data, api, token: cookies.session})
					setStatus("connected")
				}
			}
			
			handleFetch().catch(e => {
				toast.error(e.message)
				removeCookie("session")
				setStatus("disconnected")
				setSession(null)
			})
		} else {
			setStatus("disconnected")
			setSession(null)
		}
	}, [cookies, removeCookie])

	return (
		<SessionContext.Provider value={{session, status, setSession}}>
			{children}
		</SessionContext.Provider>
	)
}
