"use client"

import { GameProvider } from "@/providers/Game"

function GameLayout ({
	children,
}: {
	children: React.ReactNode,
}): React.JSX.Element {
	return (
		<GameProvider>
			{children}
		</GameProvider>
	)
}

export default GameLayout
