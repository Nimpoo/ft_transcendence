import type { Metadata } from "next"
import { Ubuntu } from "next/font/google"
import { Toaster } from "react-hot-toast"

import "bootstrap/dist/css/bootstrap.css"
import "@/styles/Background.css"
import "@/styles/global.css"

import { ModalProvider } from "@/providers/Modal"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { SessionProvider } from "@/providers/Session"
import { Suspense } from "react"

const ubu = Ubuntu ({
	subsets: ["latin"],
	weight: "500",
})

export const metadata: Metadata = {
	title: "ft_transcendence",
	description: "Our final project",
}

function RootLayout({
	children,
}: {
	children: React.ReactNode
}): React.JSX.Element {
	return (
		<html lang="en">
			<body>
				<Toaster position="bottom-right" reverseOrder />

				<div id="div" className={ubu.className}>
					<Suspense fallback={<h1>Loading... ⏳</h1>}>
						<SessionProvider>
							<ModalProvider>
								<Header />
								{children}
								<Footer />
							</ModalProvider>
						</SessionProvider>
					</Suspense>
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
