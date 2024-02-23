"use client"

import { ModalProvider } from "@/providers/Modal"

import Header from "@/components/Header"

function Template({
	children,
}: {
	children: React.ReactNode,
}): React.JSX.Element {
	return (
		<ModalProvider>
			<Header />
			{children}
		</ModalProvider>
	)
}

export default Template
