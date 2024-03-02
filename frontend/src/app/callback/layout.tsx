"use client"

import { Suspense } from "react"

function CallbackLayout({
	children,
}: {
	children: React.ReactNode
}): React.JSX.Element {
	return (
		<Suspense>
			{children}
		</Suspense>
	)
}

export default CallbackLayout
