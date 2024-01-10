"use strict"
"use client"

import Image from "next/image"
import Link from "next/link"

import { useModal } from "@/providers/Modal"

function Header(): React.JSX.Element {

	const { createModal } = useModal()

	function play(value: "luffy" | "zoro" | "nami" | "usopp") {
		let audioObject:HTMLAudioElement = new Audio(`sound/${value}.wav`)
		audioObject.volume = 0.3
		audioObject.autoplay = true
	}

	{/* ------------------------ USOPP - LOUIS ------------------------- */}
	const usoppModal =
	<div className="flex justify-between w-[900px]">
		<Image className="h-auto w-auto rounded-md shadow-[4px_4px_4px_rgba(0,0,0,0.25)]"
			src={"/Louis.jpg"}
			width={400}
			height={400}
			alt="Louis Sylvestre"
		/>
		<div className="flex flex-col flex-grow pl-4 space-y-4">
			<h1 className="text-3xl text-center">Louis Sylvestre</h1>
			<div className="space-y-4">
				<Link target="_blank" href="https://www.linkedin.com/in/louis-sylvestre-093264280/"
						className="flex flex-row items-center hover:bg-black/10 active:bg-black/25 transition-all rounded-lg">
					<Image
						src={"/svg/linkedin_logo.svg"}
						width={40}
						height={40}
						alt="LinkedIn's logo"
					/>
					<p className="flex-grow text-center text-lg">Louis Sylvestre</p>
				</Link>
				<Link target="_blank" href="https:github.com/Vodki"
						className="flex flex-row items-center hover:bg-black/10 active:bg-black/25 transition-all rounded-lg">
					<Image className="m-1"
						src={"/svg/github_logo.svg"}
						width={32}
						height={32}
						alt="GitHub's logo"
					/>
					<p className="flex-grow text-center text-lg">Vodki</p>
				</Link>
				<Link target="_blank" href="mailto:losylves@student.42nice.fr"
						className="flex flex-row items-center hover:bg-black/10 active:bg-black/25 transition-all rounded-lg">
					<Image className="m-1"
						src={"/svg/mail.svg"}
						width={32}
						height={32}
						alt="LinkedIn's logo"
					/>
					<p className="flex-grow text-center text-lg">losylves@student.42nice.fr</p>
				</Link>
			</div>
		</div>
	</div>
	{/* ---------------------------------------------------------------- */}

	{/* ------------------------ NAMI - JUSTINE ------------------------ */}
	const namiModal = 
	<div className="flex justify-between w-[700px]">
		<Image className="h-auto w-auto rounded-md shadow-[4px_4px_4px_rgba(0,0,0,0.25)]"
			src={"/Justine.jpg"}
			width={195}
			height={195}
			alt="Justine Munoz"
		/>
		<div className="flex flex-col flex-grow pl-4 space-y-4">
			<h1 className="text-3xl text-center">Justine Munoz</h1>
			<div className="space-y-4">
				<Link target="_blank" href="https://fr.wikipedia.org/wiki/Arctic_Monkeys"
						className="flex flex-row items-center hover:bg-black/10 active:bg-black/25 transition-all rounded-lg">
					<Image
						src={"/svg/linkedin_logo.svg"}
						width={40}
						height={40}
						alt="LinkedIn's logo"
					/>
					<p className="flex-grow text-center text-lg">Justine Munoz</p>
				</Link>
				<Link target="_blank" href="https://github.com/jumunozz"
						className="flex flex-row items-center hover:bg-black/10 active:bg-black/25 transition-all rounded-lg">
					<Image className="m-1"
						src={"/svg/github_logo.svg"}
						width={32}
						height={32}
						alt="GitHub's logo"
					/>
					<p className="flex-grow text-center text-lg">jumunozz</p>
				</Link>
				<Link target="_blank" href="mailto:jumunoz@student.42nice.fr"
						className="flex flex-row items-center hover:bg-black/10 active:bg-black/25 transition-all rounded-lg">
					<Image className="m-1"
						src={"/svg/mail.svg"}
						width={32}
						height={32}
						alt="LinkedIn's logo"
					/>
					<p className="flex-grow text-center text-lg">jumunoz@student.42nice.fr</p>
				</Link>
			</div>
		</div>
	</div>
	{/* ---------------------------------------------------------------- */}

	{/* ------------------------- ZORO - NOAH -------------------------- */}
	const zoroModal =
	<div className="flex justify-between w-[700px]">
		<Image className="h-auto w-auto rounded-md shadow-[4px_4px_4px_rgba(0,0,0,0.25)]"
			src={"/NBG.jpg"}
			width={195}
			height={195}
			alt="Noah Alexandre"
		/>
		<div className="flex flex-col flex-grow pl-4 space-y-4">
			<h1 className="text-3xl text-center">Noah Alexandre</h1>
			<div className="space-y-4">
				<Link target="_blank" href="https:w	linkedin.com/in/noahalexandre"
						className="flex flex-row items-center hover:bg-black/10 active:bg-black/25 transition-all rounded-lg">
					<Image
						src={"/svg/linkedin_logo.svg"}
						width={40}
						height={40}
						alt="LinkedIn's logo"
					/>
					<p className="flex-grow text-center text-lg">Noah Alexandre</p>
				</Link>
				<Link target="_blank" href="https:github.com/noalexan"
						className="flex flex-row items-center hover:bg-black/10 active:bg-black/25 transition-all rounded-lg">
					<Image className="m-1"
						src={"/svg/github_logo.svg"}
						width={32}
						height={32}
						alt="GitHub's logo"
					/>
					<p className="flex-grow text-center text-lg">noalexan</p>
				</Link>
				<Link target="_blank" href="mailto:noalexan@student.42nice.fr"
						className="flex flex-row items-center hover:bg-black/10 active:bg-black/25 transition-all rounded-lg">
					<Image className="m-1"
						src={"/svg/mail.svg"}
						width={32}
						height={32}
						alt="LinkedIn's logo"
					/>
					<p className="flex-grow text-center text-lg">noalexan@student.42nice.fr</p>
				</Link>
			</div>
		</div>
	</div>
	{/* ---------------------------------------------------------------- */}

	{/* ------------------------ LUFFY - MARWAN ------------------------ */}
	const luffyModal =
	<div className="flex justify-between w-[900px]">
		<Image className="h-auto w-auto rounded-md shadow-[4px_4px_4px_rgba(0,0,0,0.25)]"
			src={"/Marwan.jpg"}
			width={195}
			height={195}
			alt="Marwan Ayoub"
		/>
		<div className="flex flex-col flex-grow pl-4 space-y-4">
			<h1 className="text-3xl text-center">Marwan Ayoub</h1>
			<div className="space-y-4">
				<Link target="_blank" href="https://www.linkedin.com/in/mar-ayb/"
						className="flex flex-row items-center hover:bg-black/10 active:bg-black/25 transition-all rounded-lg">
					<Image
						src={"/svg/linkedin_logo.svg"}
						width={40}
						height={40}
						alt="LinkedIn's logo"
					/>
					<p className="flex-grow text-center text-lg">Marwan Ayoub</p>
				</Link>
				<Link target="_blank" href="https://github.com/Nimpoo"
						className="flex flex-row items-center hover:bg-black/10 active:bg-black/25 transition-all rounded-lg">
					<Image className="m-1"
						src={"/svg/github_logo.svg"}
						width={32}
						height={32}
						alt="GitHub's logo"
					/>
					<p className="flex-grow text-center text-lg">Nimpoo</p>
				</Link>
				<Link target="_blank" href="mailto:marwan.ayoub.pro@gmail.com"
						className="flex flex-row items-center hover:bg-black/10 active:bg-black/25 transition-all rounded-lg">
					<Image className="m-1"
						src={"/svg/mail.svg"}
						width={32}
						height={32}
						alt="LinkedIn's logo"
					/>
					<p className="flex-grow text-center text-lg">marwan.ayoub.pro@gmail.com</p>
				</Link>
			</div>
		</div>
	</div>
	{/* ---------------------------------------------------------------- */}

	return (

		<header className="
			bg-neutral-950 bg-opacity-[0.08]
			my-11
			xl:h-20 lg:h-16 
			flex justify-center items-center
		">

			{/* ------------------------ USOPP - LOUIS ------------------------- */}
			<button onClick={() => { createModal(usoppModal, 900); play("usopp"); }} className="mr-3">
				<Image priority className="drop-shadow-[4px_4px_2px_rgba(0,0,0,0.25)]" 
					src={"/mugiwara/ussop.png"}
					width={68}
					height={68}
					alt="Sniperking !"
				/>
			</button>
			{/* ---------------------------------------------------------------- */}

			{/* ------------------------ NAMI - JUSTINE ------------------------ */}
			<button onClick={() => { createModal(namiModal, 700); play("nami"); }} className="mr-3">
				<Image className="drop-shadow-[4px_4px_2px_rgba(0,0,0,0.25)]" 
					src={"/mugiwara/nami.png"}
					width={68}
					height={68}
					alt="Tangarine !"
				/>
			</button>
			{/* ---------------------------------------------------------------- */}

			<Link href="/">
				<h1 className="
					text-gray-900 dark:text-white
					xl:text-6xl lg:text-5xl md:text-3xl sm:text-2xl text-center
					drop-shadow-[4px_3px_1px_rgba(0,0,0,0.25)]
				">
					The Transcendence
				</h1>
			</Link>

			{/* ------------------------- ZORO - NOAH -------------------------- */}
			<button onClick={() => { createModal(zoroModal, 700); play("zoro"); }} className="ml-3">
				<Image className="w-auto h-auto drop-shadow-[4px_4px_2px_rgba(0,0,0,0.25)]" 
					src={"/mugiwara/zoro.png"}
					width={60}
					height={60}
					alt="Saber !"
				/>
			</button>
			{/* ---------------------------------------------------------------- */}

			{/* ------------------------ LUFFY - MARWAN ------------------------ */}
			<button onClick={() => { createModal(luffyModal, 900); play("luffy"); }} className="ml-3">
				<Image className="w-auto h-auto drop-shadow-[4px_4px_2px_rgba(0,0,0,0.25)]" 
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
