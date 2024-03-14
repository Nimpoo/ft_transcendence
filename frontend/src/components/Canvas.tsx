import { useEffect, useRef } from "react"

function Canvas({
	props,
}: {
	props?: any,
}) {
	const ref = useRef<HTMLCanvasElement>(null)

	useEffect(() => {
		const canvas = ref.current

		if (canvas) {
			const parent = canvas.parentElement
			if (parent) {
				const { width, height } = parent.getBoundingClientRect()

				const dpi = window.devicePixelRatio
				canvas.width = width * dpi
				canvas.height = height * dpi
				canvas.style.width = `${width}px`
				canvas.style.height = `${height}px`

				const context = canvas.getContext("2d")
				if (context) {
					context.scale(dpi, dpi)

					const theVoid = (context: CanvasRenderingContext2D) => {
						context.fillStyle = "black"
						context.fillRect(0, 0, canvas.width, canvas.height)
					}

					const net = (context: CanvasRenderingContext2D) => {
						const x = width / 2, y = 0, w = width / 130, h = height
						context.beginPath()
						context.lineWidth = w
						context.setLineDash([30, 20])
						context.moveTo(x, 0)
						context.lineTo(x, h)
						context.strokeStyle = "white"
						context.stroke()
					}

				theVoid(context)
				net(context)
			}
		}
	}
}, [Canvas])

	return (<canvas ref={ref} {...props} />)
}

export default Canvas
