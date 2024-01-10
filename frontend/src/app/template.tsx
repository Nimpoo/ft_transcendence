"use client"

import { ModalProvider } from "@/providers/Modal"
import { SessionProvider } from "next-auth/react"

import Header from "@/components/Header"
import Footer from "@/components/Footer"

function Template({
	children,
}: {
	children: React.ReactNode,
}) : React.JSX.Element {
	return (
		<SessionProvider>
			<ModalProvider>
				<Header />
				{children}
				<Footer />
			</ModalProvider>
		</SessionProvider>
	)
}

export default Template
