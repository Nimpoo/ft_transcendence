"use strict"
"use client"

import { ModalProvider } from "@/providers/Modal"

function Template({
	children,
}: {
	children: React.ReactNode
}) : React.JSX.Element {

	return (
		<ModalProvider>
			{children}
		</ModalProvider>
	)

}

export default Template
