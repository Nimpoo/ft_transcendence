"use strict"
"use client"

// import { Metadata } from "next"
import { Ubuntu } from "next/font/google"
import React, { useState } from "react";

import "tailwindcss/tailwind.css"
import "@/styles/Background.css"

import Header from "@/components/Header"
import Modal from "@/components/Modal";

const ubu = Ubuntu ({
	subsets: ["latin"],
	weight: "500"
})

// export const metadata: Metadata = {
// 	title: "ft_transcendence",
// 	description: "a 42 project",
// }

function RootLayout({
	children
}: {
	children: React.ReactNode
}): JSX.Element {

	const [modalFrame, setModalFrame] = useState<React.ReactNode>();

	function openModal({
		children,
		width,
		height,
	}: {
		children: React.ReactNode,
		width?: number,
		height?: number,
	}) {
		setModalFrame(<Modal width={width} height={height} closeModal={() => setModalFrame(null)}>{children}</Modal>);
	};

	return (
		<html lang="en">
			<head>
			</head>
			<body className={ "bg-[url('/bg.png')] bg-cover bg-fixed bg-center bg-no-repeat text-white " + ubu.className }>
				{modalFrame}
				<div className="m-auto max-w-7xl">
					<Header />
					{children}
					<div id="gradient-bg">
						<div id="gradient-container">
							<div id="g1" />
							<div id="g2" />
							<div id="g3" />
							<div id="g4" />
							<div id="g5" />
						</div>
					</div>
				</div>
			</body>
		</html>
	)
}

export default RootLayout
