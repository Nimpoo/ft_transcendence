"use client"

import Image from "next/image"
import Link from "next/link"

import { useModal } from "@/providers/Modal"

import "@/styles/Header.css"
import "@/styles/Modal.css"

function Header(): React.JSX.Element {

	const { createModal } = useModal()

	function play(value: "luffy" | "zoro" | "nami" | "usopp") {
		let audioObject:HTMLAudioElement = new Audio(`sound/${value}.wav`)
		audioObject.volume = 0.3
		audioObject.autoplay = true
	}

	{/* ------------------------ USOPP - LOUIS ------------------------- */}
	const usoppModal =
	<div className="modal-wrapper-lg">
		<Image className="modal-pfp"
			src={"/assets_bogoss/Louis.jpg"}
			width={400}
			height={400}
			alt="Louis Sylvestre"
		/>
		<div className="modal-info-wrapper spaceY-between-btn-4">
			<h1 style={{fontSize: "1.875rem", lineHeight: "2.25rem", textAlign: "center"}}>Louis Sylvestre</h1>
			<div className="spaceY-between-btn-4">
				<Link
					target="_blank"
					href="https://www.linkedin.com/in/louis-sylvestre-093264280/"
					className="button-selector"
				>
					<Image
						src={"/svg/linkedin_logo.svg"}
						width={40}
						height={40}
						alt="LinkedIn logo"
					/>
					<p className="text-for-button">Louis Sylvestre</p>
				</Link>
				<Link
					target="_blank"
					href="https://github.com/Vodki"
					className="button-selector"
				>
					<Image
						style={{margin: "0.25rem"}}
						src={"/svg/github_logo.svg"}
						width={32}
						height={32}
						alt="GitHub logo"
					/>
					<p className="text-for-button">Vodki</p>
				</Link>
				<Link
					target="_blank"
					href="mailto:losylves@student.42nice.fr"
					className="button-selector"
				>
					<Image
						style={{margin: "0.25rem"}}
						src={"/svg/mail_logo.svg"}
						width={32}
						height={32}
						alt="Mail logo"
					/>
					<p className="text-for-button">losylves@student.42nice.fr</p>
				</Link>
			</div>

		</div>
	</div>
	{/* ---------------------------------------------------------------- */}

	{/* ------------------------ NAMI - JUSTINE ------------------------ */}
	const namiModal =
	<div className="modal-wrapper-lg">
		<Image className="modal-pfp"
			src={"/assets_bogoss/Justine.jpg"}
			width={250}
			height={250}
			alt="Justine Munoz"
		/>
		<div className="modal-info-wrapper spaceY-between-btn-4">
			<h1 style={{fontSize: "1.875rem", lineHeight: "2.25rem", textAlign: "center"}}>Justine Munoz</h1>
			<div className="spaceY-between-btn-4">
				<Link
					target="_blank"
					href="https://fr.wikipedia.org/wiki/Arctic_Monkeys"
					className="button-selector"
				>
					<Image
						src={"/svg/linkedin_logo.svg"}
						width={40}
						height={40}
						alt="LinkedIn logo"
					/>
					<p className="text-for-button">Justine Munoz</p>
				</Link>
				<Link
					target="_blank"
					href="https://github.com/jumunozz"
					className="button-selector"
				>
					<Image
						style={{margin: "0.25rem"}}
						src={"/svg/github_logo.svg"}
						width={32}
						height={32}
						alt="GitHub logo"
					/>
					<p className="text-for-button">jumunozz</p>
				</Link>
				<Link
					target="_blank"
					href="mailto:jumunoz@student.42nice.fr"
					className="button-selector"
				>
					<Image
						style={{margin: "0.25rem"}}
						src={"/svg/mail_logo.svg"}
						width={32}
						height={32}
						alt="Mail logo"
					/>
					<p className="text-for-button">jumunoz@student.42nice.fr</p>
				</Link>
			</div>

		</div>
	</div>
	{/* ---------------------------------------------------------------- */}

	{/* ------------------------- ZORO - NOAH -------------------------- */}
	const zoroModal =
	<div className="modal-wrapper-lg">
		<Image className="modal-pfp"
			src={"/assets_bogoss/NBG.jpg"}
			width={250}
			height={250}
			alt="Noah Alexandre"
		/>
		<div className="modal-info-wrapper spaceY-between-btn-4">
			<h1 style={{fontSize: "1.875rem", lineHeight: "2.25rem", textAlign: "center"}}>Noah Alexandre</h1>
			<div className="spaceY-between-btn-4">
				<Link
					target="_blank"
					href="https://linkedin.com/in/noahalexandre"
					className="button-selector"
				>
					<Image
						src={"/svg/linkedin_logo.svg"}
						width={40}
						height={40}
						alt="LinkedIn logo"
					/>
					<p className="text-for-button">Noah Alexandre</p>
				</Link>
				<Link
					target="_blank"
					href="https://github.com/noalexan/"
					className="button-selector"
				>
					<Image
						style={{margin: "0.25rem"}}
						src={"/svg/github_logo.svg"}
						width={32}
						height={32}
						alt="GitHub logo"
					/>
					<p className="text-for-button">noalexan</p>
				</Link>
				<Link
					target="_blank"
					href="mailto:noalexan@student.42nice.fr"
					className="button-selector"
				>
					<Image
						style={{margin: "0.25rem"}}
						src={"/svg/mail_logo.svg"}
						width={32}
						height={32}
						alt="Mail logo"
					/>
					<p className="text-for-button">noalexan@student.42nice.fr</p>
				</Link>
			</div>

		</div>
	</div>
	{/* ---------------------------------------------------------------- */}

	{/* ------------------------ LUFFY - MARWAN ------------------------ */}
	const luffyModal =
	<div className="modal-wrapper-lg">
		<Image className="modal-pfp"
			src={"/assets_bogoss/Marwan.jpg"}
			width={400}
			height={400}
			alt="Marwan Ayoub"
		/>
		<div className="modal-info-wrapper spaceY-between-btn-4">
			<h1 style={{fontSize: "1.875rem", lineHeight: "2.25rem", textAlign: "center"}}>Marwan Ayoub</h1>
			<div className="spaceY-between-btn-4">
				<Link
					target="_blank"
					href="https://www.linkedin.com/in/mar-ayb/"
					className="button-selector"
				>
					<Image
						src={"/svg/linkedin_logo.svg"}
						width={40}
						height={40}
						alt="LinkedIn logo"
					/>
					<p className="text-for-button">Marwan Ayoub</p>
				</Link>
				<Link
					target="_blank"
					href="https://github.com/Nimpoo"
					className="button-selector"
				>
					<Image
						style={{margin: "0.25rem"}}
						src={"/svg/github_logo.svg"}
						width={32}
						height={32}
						alt="GitHub logo"
					/>
					<p className="text-for-button">Nimpoo</p>
				</Link>
				<Link
					target="_blank"
					href="mailto:mayoub@student.42nice.fr"
					className="button-selector"
				>
					<Image
						style={{margin: "0.25rem"}}
						src={"/svg/mail_logo.svg"}
						width={32}
						height={32}
						alt="Mail logo"
					/>
					<p className="text-for-button">mayoub@student.42nice.fr</p>
				</Link>
			</div>

		</div>
	</div>
	{/* ---------------------------------------------------------------- */}

	return (

		<header id="rectangle">

			{/* ------------------------ USOPP - LOUIS ------------------------- */}
			<button onClick={() => { createModal(usoppModal, 900); play("usopp"); }} className="mugiwara">
				<Image
					src={"/mugiwara/ussop.png"}
					width={68}
					height={68}
					alt="Sniperking !"
				/>
			</button>
			{/* ---------------------------------------------------------------- */}

			{/* ------------------------ NAMI - JUSTINE ------------------------ */}
			<button onClick={() => { createModal(namiModal, 700); play("nami"); }} className="mugiwara">
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
			<button onClick={() => { createModal(zoroModal, 700); play("zoro"); }} className="mugiwara">
				<Image className="luffy-zoro"
					src={"/mugiwara/zoro.png"}
					width={60}
					height={60}
					alt="Saber !"
				/>
			</button>
			{/* ---------------------------------------------------------------- */}

			{/* ------------------------ LUFFY - MARWAN ------------------------ */}
			<button onClick={() => { createModal(luffyModal, 900); play("luffy"); }} className="mugiwara">
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
