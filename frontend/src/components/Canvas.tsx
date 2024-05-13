"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

import { useSession } from "@/providers/Session"
import { useModal } from "@/providers/Modal"
import { useGame } from "@/providers/Game"

import Link from "next/link"

import "@/styles/game/Game.css"

let score1 = 0
let score2 = 0

interface Ball {
	coord: [number, number],
	dimensions: [number, number],
	dir: [number, number],
	color: string,
	draw: () => void,
}

var square: Ball = {
	coord: [0, 0],
	dimensions: [0, 0],
	dir: [0, 0],
	color: "white",
	draw: function() {},
}

function Canvas({
	props,
}: {
	props?: any,
}): React.JSX.Element {

	const router = useRouter()

	// ? /*--------- End Game Screen ----------*/
	const { clearModal } = useModal()

	const endGame =
	<button>
		PLACEHOLDER
	</button>
	// ? /*------------------------------------*/

	const { session } = useSession()
	const { createModal } = useModal()
	const { message, sendMessage, gameStatus, setGameStatus } = useGame()

	const ref = useRef<HTMLCanvasElement>(null)

	useEffect(() => {
		// * get the current ref
		const canvas = ref.current

		if (canvas) {
			// * this is necessary for a good resolution of all draw in the canva
			const { width, height } = canvas.getBoundingClientRect()
			const dpi = window.devicePixelRatio

			canvas.width = width * dpi
			canvas.height = height * dpi

			// * context 2D : the 2D "graphic engine"
			const context = canvas.getContext("2d")
			if (context) {
				context.scale(dpi, dpi)

/////////////////////////////////////////////////////
// ????????????????? CONSTRUCTIONS ??????????????????
				// * /*-------------- GROUND --------------*/
				const ground = () => {
					context.clearRect(0, 0, canvas.width, canvas.height)

					const x = width / 2, y = 0, w = width / 225, h = height
					context.beginPath()
					context.lineWidth = w
					context.setLineDash([30, 20])
					context.moveTo(x, y)
					context.lineTo(x, h)
					context.strokeStyle = "white"
					context.stroke()

					context.font = "100px Pong"
					context.fillStyle = "white"
				}
				// * /*------------------------------------*/

				// ? /*-------------- PADDLES -------------*/
				// PADDLE DRAWING HERE
				// ? /*------------------------------------*/

				// ! /*--------------- BALL ---------------*/
				if (message && message.type === "game.update" && gameStatus !== "finished") {
					const data = message

					var coord_maj:	[number, number] = data.new_position?.coordinates ?? [0, 0]
					var dim_maj:		[number, number] = data.new_position?.dimensions ?? [0, 0]
					var dir_maj:		[number, number] = data.new_position?.speed ?? [0, 0]

					square = {
						coord:      [coord_maj[0] * width, coord_maj[1] * height],
						dimensions: [dim_maj[0] * height, dim_maj[1] * height],
						dir:        [dir_maj[0] * width, dir_maj[1] * height],
						color: "white",
						draw: function() {
							context.beginPath()
							context.save()
							context.translate(
								-(this.dimensions[0] / 2),
								-(this.dimensions[1] / 2),
							)
							context.closePath()
							context.fillStyle = this.color
							context.fillRect(
								this.coord[0],
								this.coord[1],
								this.dimensions[0],
								this.dimensions[1],
							)
							context.restore()
						},
						// console.log("coordonée", square.coord, score1++)
						// console.log("speed", square.dir, score2++)
					}
				}
				// ! /*------------------------------------*/
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////

/////////////////////////////////////////////////////
// !!!!!!!!!!!!!!!!!!!!! GAME !!!!!!!!!!!!!!!!!!!!!!!
				// ? /*------------ DEMO MODE -------------*/
				const demo = () => {
					context.clearRect(0, 0, canvas.width, canvas.height)

					ground()

					context.fillText("0", width / 5, height / 3.75)
					context.fillText("0", width * 4 / 5, height / 3.75)
				}
				// ? /*------------------------------------*/

				// ? /*----------- PLAYING MODE -----------*/
				const playing = () => {
					context.clearRect(0, 0, canvas.width, canvas.height)

					ground()

					// ? The ball
					square.draw()

					// ? The score
					context.fillText(`${score1}`, width / 5, height / 3.75)
					context.fillText(`${score2}`, width * 4 / 5, height / 3.75)

					// ? The collisions
						// square.coord[0] += square.dir[0]
						// square.coord[1] += square.dir[1]
				}
				// ? /*------------------------------------*/
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////

				let animationFrameId: number

				// * the animation loop
				console.log("THE GAME STATUS IS: ", gameStatus)
				const animate = () => {
					animationFrameId = window.requestAnimationFrame(animate)
					if (gameStatus === "pending") {
						demo()

					} else if (gameStatus === "in-game") {
						playing()

					} else if (gameStatus === "finished") {
						if (sendMessage) {
							sendMessage({
								"type": "game.finished",
								"user": session?.nickname,
							})
						}
						router.push("/game")
						createModal(endGame)
						setGameStatus("pending")
					}
				}

				animate()

				return () => { window.cancelAnimationFrame(animationFrameId) }
			}
		}
	}, [message, gameStatus])

	return (<canvas ref={ref} className="game" style={{backgroundColor: "black"}} {...props} />)
}

export default Canvas
