"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useCookies } from "react-cookie"

interface Session {
	id: number,
	nickname: string,
}

type Status = 'loading'|'connected'|'disconnected'

const SessionContext = createContext<{
	session: Session|null,
	status: Status
}>({
	session: null,
	status: 'loading'
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
	const [status, setStatus] = useState<Status>('loading')
	const [cookies] = useCookies(["session"])

	useEffect(() => {
		if (cookies.session) {
			fetch(
				'/api/users/me',
				{
					headers: {
						Authorization: `Bearer ${cookies.session}`
					}
				}
			)
				.then(response => {
					if (response.status != 200)
						throw new Error(`/api/users/me returned ${response.status}`)
					return response.json()
				})
				.then((data: Session) => {
					setSession(data)
					setStatus('connected')
				})
				.catch(error => {
					setStatus('disconnected')
				})
		} else {
			setStatus('disconnected')
		}
	}, [setSession, setStatus, cookies])

	return (
		<SessionContext.Provider value={{ session, status }}>
			{children}
		</SessionContext.Provider>
	)
}
