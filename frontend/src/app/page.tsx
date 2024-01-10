"use strict"
"use client"

import { Roboto, Ubuntu } from "next/font/google"
import { useEffect, useState } from "react"
import { ClientSafeProvider, getProviders, signIn, useSession } from "next-auth/react"

import Image from "next/image"
import Link from "next/link"

import "@/styles/Home.css"
import "@/styles/Rainbow.css"

import Loading from "./loading"

const ubu = Ubuntu ({
	subsets: ["latin"],
	weight: "700"
})

const rob = Roboto({
	subsets: ["latin"],
	weight: "400"
})

function ProviderButton({
	provider, index
}: {
	provider: ClientSafeProvider, index: number
}): React.JSX.Element {
	return (
		<div style={{ animation: `1s ease-in-out ${1 + .2 * index}s forwards appear` }} className="provider-buttons group flex flex-row items-center text-black">

			{/* Particles (left) */}
			<div className="flex flex-col">
				<div className="transition-all my-2 origin-top-right rotate-[24deg] group-hover:w-7 w-0 h-2 group-active:bg-[#bf60ef] bg-[#dab3b3aa]" />
				<div className="relative transition-all my-2 right-[0.40rem] group-hover:w-7 w-0 h-2 group-active:bg-[#bf60ef] bg-[#dab3b3aa]" />
				<div className="transition-all my-2 origin-bottom-right -rotate-[24deg] group-hover:w-7 w-0 h-2 group-active:bg-[#bf60ef] bg-[#dab3b3aa]" />
			</div>

			<button
				className={`transition duration-300 w-64 h-16 m-1 flex justify-start items-center bg-white rounded-lg hover:border-opacity-0 border-[#D9D9D9] border-[3px] active:opacity-80 ` + rob.className}
				onClick={() => signIn(provider.id)}
			>
				<Image className="mx-3" src={`/svg/${provider.id}_logo.svg`} width={33} height={33} alt={`${provider.name} logo`} />
				<p>Continue with {provider.name}</p>
			</button>

			{/* Particles (right) */}
			<div className="flex flex-col">
				<div className="transition-all my-2 origin-top-left -rotate-[24deg] group-hover:w-7 w-0 h-2 group-active:bg-[#bf60ef] bg-[#dab3b3aa] " />
				<div className="relative transition-all my-2 left-[0.40rem] group-hover:w-7 w-0 h-2 group-active:bg-[#bf60ef] bg-[#dab3b3aa] " />
				<div className="transition-all my-2 origin-bottom-left rotate-[24deg] group-hover:w-7 w-0 h-2 group-active:bg-[#bf60ef] bg-[#dab3b3aa] " />
			</div>

		</div>
	)
}

function Home(): JSX.Element {

	const [ providers, setProviders ] = useState<ClientSafeProvider[] | React.JSX.Element>(<Loading />)

	const { data: session, status } = useSession()

	useEffect(() => {
		getProviders().then(p => p ? setProviders(Object.values(p)) : setProviders(<p>no provider</p>))
	}, [])

	if (status === "loading") {
		return <Loading />
	}

	if (session || 1) {
		return (
			<main className="flex flex-row w-full h-[39rem] items-center justify-between">
				<div className="flex flex-col flex-nowrap items-stretch justify-start p-3 space-y-3 w-[350px] h-full rounded-3xl bg-[#D9D9D9] shadow-[5px_5px_0_1px_rgba(0,0,0,0.25)]">

				</div>

				<button className={ "w-80 h-[175px] rounded-3xl bg-[#D9D9D9]/10 shadow-[5px_5px_0_1px_rgba(0,0,0,0.25)] text-8xl hover:bg-[#D9D9D9]/30 active:bg-[#D9D9D9]/60 transition-all text-transparent " + ubu.className }>
					<span className="stroke rainbow-text">PLAY</span>
				</button>

				<div className="flex flex-col w-[350px] justify-between h-full">
					<div className="flex flex-row justify-between w-full h-[15%] p-3 rounded-3xl text-black bg-[#D9D9D9] shadow-[5px_5px_0_1px_rgba(0,0,0,0.25)] space-x-2">
						<div className="relative h-full w-[70px]">
							<Link href="/profile">
								<Image className="rounded-full"
									src={"https://thispersondoesnotexist.com"}
									width={70}
									height={70}
									alt="Your Profile Picture"
								/>
							</Link>
							<Image className="absolute -bottom-1 -right-1"
								src={"/assets_ranking/challenger_1.png"}
								width={31}
								height={31}
								alt="Challenger 1"
							/>
						</div>
						<div className="flex flex-col justify-between flex-grow overflow-hidden">
							<h3 className="text-2xl truncate">{session?.user?.name}</h3>
							<div className="flex flex-row items-center justify-end flex-grow text-xl">
								<span className="px-2 truncate">0</span>
								<Image
									src={"/assets_ranking/trophy.png"}
									width={35}
									height={35}
									alt="Trophy"
								/>
							</div>
						</div>
					</div>

					<div className="flex flex-col flex-nowrap items-stretch justify-start p-3 space-y-3 w-full h-[79%] rounded-3xl bg-[#D9D9D9] shadow-[5px_5px_0_1px_rgba(0,0,0,0.25)]">

					</div>
				</div>
			</main>
		)
	}
	
	return (
		<main className="pt-4">

			<div className="flex items-center justify-between">

				<h1 id="title" className="xl:text-9xl lg:text-8xl md:text-7xl sm:text-5xl text-gray-900 dark:text-white text-start">
					<span>Welcome</span><br />
					<span>to our</span><br />
					<span>Final Project.</span>
				</h1>

				<div id="provider-button-list" className="items-center justify-center flex max-h-[384px] max-w-[500px] flex-col flex-grow flex-wrap text-center">
					{ providers ? Array.isArray(providers) ? providers.map((provider, index) => <ProviderButton index={index} key={provider.id} provider={provider} />) : providers : null }
				</div>

			</div>

			<div className="mt-44 animate-bounce">
				<Image className="opacity-60 m-auto" src="/svg/arrow.svg" width={37.5} height={37.5} alt="Scroll !" />
			</div>

		</main>
	)
}

export default Home
