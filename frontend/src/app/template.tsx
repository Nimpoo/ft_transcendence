"use client"

import { ModalProvider } from "@/providers/Modal"
import { SessionProvider } from "next-auth/react"

function Template({
	children,
}: {
	children: React.ReactNode,
}) : React.JSX.Element {
	return (
		<SessionProvider>
			<ModalProvider>
				{children}
			</ModalProvider>
		</SessionProvider>
	)
}

export default Template
