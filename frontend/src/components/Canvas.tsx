import { useEffect, useRef } from "react"

import "@/styles/game/Game.css"

let score1 = 0
let score2 = 0

interface Ball {
	coord: {
		x: number,
		y: number
	}
	dimensions: {
		w: number,
		h: number,
	},
	dir: {
		vx: number,
		vy: number,
	},
	color: string,
	draw: () => void,
}

function Canvas({
	props,
}: {
	props?: any,
}): React.JSX.Element {
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

				// ! /*--------------- BALL ---------------*/
				var square: Ball = {
					coord: {
						x: width / 2,
						y: height / 2,
					},
					dimensions: {
						w: height / 35,
						h: height / 35,
					},
					dir: {
						vx: 5.25,
						vy: 5.25,
					},
					color: "white",
					draw: function() {
						context.beginPath()
						context.save()
						context.translate(-(this.dimensions.w / 2), -(this.dimensions.h / 2))
						context.closePath()
						context.fillStyle = this.color
						context.fillRect(this.coord.x, this.coord.y, this.dimensions.w, this.dimensions.h)
						context.restore()
					},
				}
				// ! /*------------------------------------*/

				let animationFrameId: number

				// * the animation loop
				const animate = () => {
						animationFrameId = window.requestAnimationFrame(animate)
						demo()
				}

				// * the draw for the demo mode
				const demo = () => {
					context.clearRect(0, 0, canvas.width, canvas.height)

					// ? The net
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

					// ? The ball
					square.draw()

					// ? The collisions
					if (square.coord.x + square.dir.vx + (square.dimensions.w / 2) > width || square.coord.x + square.dir.vx - (square.dimensions.w / 2) < 0) {
						square.dir.vx *= -1
						square.dir.vy += Math.random() + (0.500 - 0.0200) + 0.200
					}

					if (square.coord.y + square.dir.vy + (square.dimensions.h / 2) > height || square.coord.y + square.dir.vy - (square.dimensions.h / 2) < 0) {
						square.dir.vy *= -1
						square.dir.vx += Math.random() + (0.500 - 0.0200) + 0.200
					}

					context.fillText(`${score1}`, width / 5, height / 3.75)
					context.fillText(`${score2}`, width * 4 / 5, height / 3.75)
					square.coord.x += square.dir.vx
					square.coord.y += square.dir.vy
				}
				animate()

				return () => { window.cancelAnimationFrame(animationFrameId) }
			}
		}
	}, [])

	return (<canvas ref={ref} className="game" style={{backgroundColor: "black"}} {...props} />)
}

export default Canvas
