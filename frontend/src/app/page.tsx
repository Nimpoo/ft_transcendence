"use client"

import { Ubuntu } from "next/font/google"

import Link from "next/link"
import Image from "next/image"
import CountUp from "react-countup"

import "@/styles/Homepage.css"
import "@/styles/Text.css"
import "@/styles/Rainbow.css"
import "@/styles/Text.css"

import { useSession } from "@/providers/Session"

const ubu = Ubuntu ({
	subsets: ["latin"],
	weight: "700",
})

function Home(): React.JSX.Element {
	const { session, status } = useSession()

	{/* --------------------------- CONNECTED -------------------------- */}
	if (status == "loading") {
		return <></> // todo loading
	} else if (status == "connected" && session) {
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
								<Image className="pfp" priority
									src={"https://thispersondoesnotexist.com"}
									width={70}
									height={70}
									alt="Your Profile Picture">
								</Image>
							</Link>
							<Image priority className="rank"
								src={"/assets/ranking/challenger_1.png"}
								width={31}
								height={31}
								alt="Challenger 1"
							/>
						</div>
						<div className="pseudo-trophy-wrapper truncate">
							<h3 style={{fontSize: "1.5rem", lineHeight: "2rem"}}>{session.nickname}</h3>
							<div className="trophies">
								<CountUp duration={5} className="truncate" style={{paddingLeft: "0.5rem", paddingRight: "0.5rem"}} end={0} />
								<Image priority
									src={"/assets/ranking/trophy.png"}
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
			<div className="container-fluid">
				<div className="row">
					<div className="col-9 mt-lg-5">
						<h1 className="fw-bold custom-font-size text-light">Welcome</h1>
						<h1 className="fw-bold custom-font-size text-light">to our</h1>
						<h1 className="fw-bold custom-font-size text-light">Final Project.</h1>
					</div>
					<div className="col-3 align-items-center align-self-center mt-5">
						<Link href={`https://api.intra.42.fr/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_REDIRECT_URI as string)}&response_type=code`}>
								<button type="button" className="btn btn-light btn-outline-info btn-with-logo px-5 py-4">
									<Image className="logo"
										src="/svg/42-school_logo.svg"
										width={24}
										height={24}
										alt="42 Logo"
									/>
									Continue with 42
								</button>
						</Link>
					</div>
				</div>
			</div>
		</main>
	)
	{/* ---------------------------------------------------------------- */}
}

export default Home
