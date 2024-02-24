"use client"

import { ModalProvider } from "@/providers/Modal"

import Header from "@/components/Header"
import Footer from "@/components/Footer"

function Template({
	children,
}: {
	children: React.ReactNode,
}): React.JSX.Element {
	return (
		<ModalProvider>
			<Header />
			{children}
			<Footer />
		</ModalProvider>
	)
}

export default Template
