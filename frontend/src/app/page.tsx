"use strict"
"use client"

import { Roboto } from "next/font/google"
import { useEffect, useState } from "react"
import { ClientSafeProvider, getProviders, signIn } from "next-auth/react"

import Image from "next/image"

import "@/styles/Home.css"
import Loading from "./loading"

const rob = Roboto({
	subsets: ['latin'],
	weight: '400'
})

function ProviderButton({ provider, index }: { provider: ClientSafeProvider, index: number }): JSX.Element {
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

	const [ providers, setProviders ] = useState<ClientSafeProvider[] | JSX.Element>(<Loading />)

	useEffect(() => {
		getProviders().then(p => p ? setProviders(Object.values(p)) : setProviders(<p>no provider</p>))
	}, [])

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
