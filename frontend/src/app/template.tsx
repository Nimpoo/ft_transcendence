"use client"

import Header from "@/components/Header"

function Template({
	children,
}: {
	children: React.ReactNode,
}) : React.JSX.Element {
	return (
		<>
			<Header />
			{children}
		</>
	)
}

export default Template
