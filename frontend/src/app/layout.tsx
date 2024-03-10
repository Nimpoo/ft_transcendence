import type { Metadata } from "next"
import { Ubuntu } from "next/font/google"

import "bootstrap/dist/css/bootstrap.css"
import "@/styles/global.css"
import "@/styles/Background.css"

const ubu = Ubuntu ({
	subsets: ["latin"],
	weight: "500",
})

export const metadata: Metadata = {
	title: "ft_transcendence",
	description: "Our final project",
}

function RootLayout({
	children,
}: {
	children: React.ReactNode
}): React.JSX.Element {
	return (
		<html lang="en">
			<head>
			</head>
			<body>

				<div id="div" className={ubu.className}>
					{children}
				</div>

				<div id="gradient-bg">
					<div id="gradient-container">
						<div id="g1" />
						<div id="g2" />
						<div id="g3" />
						<div id="g4" />
						<div id="g5" />
					</div>
				</div>

			</body>
		</html>
	)
}

export default RootLayout
