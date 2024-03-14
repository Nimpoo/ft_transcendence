"use client"

import Canvas from "@/components/Canvas"

import "@/styles/game/Game.css"

function Game(): React.JSX.Element {
	return (
		<div className="game">
			<Canvas />
		</div>
	)
}

export default Game
