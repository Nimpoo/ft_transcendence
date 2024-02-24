"use client"

import { Ubuntu } from "next/font/google"

import Link from "next/link"
import Image from "next/image"
import CountUp from "react-countup"

import "bootstrap/dist/css/bootstrap.css"
import "@/styles/global.css"
import "@/styles/Homepage.css"
import "@/styles/Rainbow.css"

const ubu = Ubuntu ({
	subsets: ["latin"],
	weight: "700",
})

const session = 1 //! 1 for CONNECTED, 0 for NOT CONNECTED (placeholder for waiting the authentification)

function Home(): React.JSX.Element {

	{/* --------------------------- CONNECTED -------------------------- */}
	if (session) {
		return (
			<main className="homepage-left-wrapper">

				<div className="history-bento space-between-btn-4">
					{/* FINISHED GAMES HERE */}
				</div>

				<button className={ "big-button " + ubu.className }>
					<span className="stroke rainbow-text text-xl">PLAY</span>
				</button>

				<div className="homepage-right-wrapper">
					<div className="profile-bento spaceX-between-btn-2">
						<div className="pfp-ranking">
							<Link href="/profile">
								<Image className="pfp"
									src={"https://thispersondoesnotexist.com"}
									width={70}
									height={70}
									alt="Your Profile Picture">
								</Image>
							</Link>
							<Image className="rank"
								src={"/assets_ranking/challenger_1.png"}
								width={31}
								height={31}
								alt="Challenger 1"
							/>
						</div>
						<div className="pseudo-trophy-wrapper truncate">
							<h3 style={{fontSize: "1.5rem", lineHeight: "2rem"}}>Nimpô</h3>
							<div className="trophies">
								<CountUp duration={5} className="truncate" style={{paddingLeft: "0.5rem", paddingRight: "0.5rem"}} end={0} />
								<Image
									src={"/assets_ranking/trophy.png"}
									width={35}
									height={35}
									alt="Trophy"
								/>
							</div>
						</div>
					</div>

					<div className="friends-bento spaceY-between-btn-3">
						{/* FRIENDS LIST HERE */}
					</div>

				</div>

			</main>
		)
	}
	{/* ---------------------------------------------------------------- */}

	{/* ------------------------ NOT CONNECTED ------------------------- */}
	return (
		<main>
			not connected
		</main>
	)
	{/* ---------------------------------------------------------------- */}
}

export default Home
