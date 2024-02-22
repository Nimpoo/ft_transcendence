"use client"

import Image from "next/image"
import Link from "next/link"

import "bootstrap/dist/css/bootstrap.css";
import "@/styles/Header.css"

function Header(): React.JSX.Element {
	return (
		<header id="rectangle">

			{/* ------------------------ USOPP - LOUIS ------------------------- */}
			<button className="mugiwara">
				<Image
					src={"/mugiwara/ussop.png"}
					width={68}
					height={68}
					alt="Sniperking !"
				/>
			</button>
			{/* ---------------------------------------------------------------- */}

			{/* ------------------------ NAMI - JUSTINE ------------------------ */}
			<button className="mugiwara">
				<Image
					src={"/mugiwara/nami.png"}
					width={68}
					height={68}
					alt="Tangarine !"
				/>
			</button>
			{/* ---------------------------------------------------------------- */}

			<Link href="/">
				<h1 className="title">
					The Transcendence
				</h1>
			</Link>

			{/* ------------------------- ZORO - NOAH -------------------------- */}
			<button className="mugiwara">
				<Image className="luffy-zoro"
					src={"/mugiwara/zoro.png"}
					width={60}
					height={60}
					alt="Saber !"
				/>
			</button>
			{/* ---------------------------------------------------------------- */}

			{/* ------------------------ LUFFY - MARWAN ------------------------ */}
			<button className="mugiwara">
				<Image className="luffy-zoro"
					src={"/mugiwara/luffy.png"}
					width={60}
					height={60}
					alt="Meat !"
				/>
			</button>
			{/* ---------------------------------------------------------------- */}

		</header>
	)
}

export default Header
