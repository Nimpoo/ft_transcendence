import type { Metadata } from "next"
import { Ubuntu } from "next/font/google"
import { Toaster } from "react-hot-toast"

import "@/styles/global.css"
import "@/styles/Background.css"
import "@/styles/global.css"

import { ModalProvider } from "@/providers/Modal"
import { SessionProvider } from "@/providers/Session"
import { SocketProvider } from "@/providers/Socket"

import "bootstrap/dist/css/bootstrap.min.css"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export const metadata: Metadata = {
	title: "ft_transcendence",
	description: "Our final project",
}

const ubu = Ubuntu ({
	subsets: ["latin"],
	weight: "500",
})

function RootLayout({
	children,
}: {
	children: React.ReactNode
}): React.JSX.Element {
	return (
		<html lang="en">
			<body className={ubu.className}>
				<Toaster position="bottom-right" reverseOrder />

				<div id="div" className="vstack py-4 gap-3" style={{minHeight: "100vh"}}>
					<SessionProvider>
						<SocketProvider>
							<ModalProvider>
								<Header />
								{children}
								<Footer />
							</ModalProvider>
						</SocketProvider>
					</SessionProvider>
				</div>

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
