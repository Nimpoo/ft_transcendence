"use client"

import { useSession } from "next-auth/react"

import Image from "next/image"
import Link from "next/link"

function Footer(): React.JSX.Element | null {

	const { data: session } = useSession()

	if (!session) {
		return null
	}

	return (
		<footer className="flex flex-row justify-center mt-4 opacity-[0.66]">
			<Link href={"/chat"} className="flex flex-row mr-3 items-center hover:scale-110 active:scale-105 transition duration-300 group">
				<Image className="mr-2 group-hover:rotate-[360deg] transition duration-1000"
					src={"/svg/chat.svg"}
					width={30}
					height={30}
					alt="Chat"
				/>
				Chat
			</Link>

			<Link href={"/settings"} className="flex flex-row ml-3 items-center hover:scale-110 active:scale-105 transition duration-300 group">
				<Image className="mr-2 group-hover:rotate-[360deg] transition duration-1000"
					src={"/svg/settings.svg"}
					width={30}
					height={30}
					alt="Settings"
				/>
				Settings
			</Link>
		</footer>
	)
}

export default Footer
