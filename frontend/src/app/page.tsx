"use client"

import { Roboto, Ubuntu } from "next/font/google"

import Link from "next/link"
import Image from "next/image"

import "bootstrap/dist/css/bootstrap.css"
import "@/styles/global.css"
import "@/styles/Homepage.css"
import "@/styles/Rainbow.css"

const ubu = Ubuntu ({
	subsets: ["latin"],
	weight: "700",
})

function Home(): React.JSX.Element {
	return (
		<main className="homepage-left-wrapper">

			<div className="history-bento space-between-btn-4">
				{/* FINISHED GAMES HERE */}
			</div>

			<button className={ "big-button " + ubu.className }>
				<span className="stroke rainbow-text text-xl">PLAY</span>
			</button>

		</main>
	)
}

export default Home
