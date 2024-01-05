"use strict"

import { Metadata } from "next"
import { Ubuntu } from "next/font/google"

import "tailwindcss/tailwind.css"
import "@/styles/Background.css"

import Header from "@/components/Header"
import { ModalProvider } from "@/providers/Modal"

const ubu = Ubuntu ({
	subsets: ["latin"],
	weight: "500"
})

export const metadata: Metadata = {
	title: "ft_transcendence",
	description: "a 42 project",
}

function RootLayout({
	children
}: {
	children: React.ReactNode
}): JSX.Element {
	return (
		<html lang="en">
			<head>
			</head>
			<body className={ "bg-[url('/bg.png')] bg-cover bg-fixed bg-center bg-no-repeat text-white " + ubu.className }>

				<ModalProvider>
					<div className="m-auto max-w-7xl">
						<Header />
						{children}
					</div>
				</ModalProvider>

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
