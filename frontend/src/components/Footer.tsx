"use client"

import Image from "next/image"
import Link from "next/link"

import "@/styles/global.css"
import "@/styles/Footer.css"

function Footer(): React.JSX.Element | null {

	const session = 1 //! 1 for CONNECTED, 0 for NOT CONNECTED (placeholder for waiting the authentification)

	if (session) {
		return (
			<footer className="footer-wrapper">
				<Link href="/chat" className="link">
					<Image className="image"
						src={"/svg/chat.svg"}
						width={30}
						height={30}
						alt="Chat"
					/>
					Chat
				</Link>

				<Link href="/settings" className="link">
					<Image className="image"
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

	return null
}

export default Footer
