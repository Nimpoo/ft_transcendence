"use client"

import { SessionProvider } from "next-auth/react"

function Template({
	children,
}: {
	children: React.ReactNode,
}): React.JSX.Element {

	return (
		<SessionProvider>
			{children}
		</SessionProvider>
	)

}

export default Template
