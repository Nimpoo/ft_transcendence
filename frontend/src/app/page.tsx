"use client"

import Link from "next/link"
import Image from "next/image"
import CountUp from "react-countup"

import "@/styles/Homepage.css"
import "@/styles/Text.css"
import "@/styles/Rainbow.css"

import { useSession } from "@/providers/Session"
import FriendsList from "@/components/FriendsList"
import UserSearchBar from "@/components/UserSearchBar"
import Loading from "./loading"


function Home(): React.JSX.Element {
	const { session, status } = useSession()

	if (status == "loading") {
		return <Loading />
	}

	else if (status == "connected" && session) {
		{/* --------------------------- CONNECTED -------------------------- */}
		return (
			<main className="homepage-left-wrapper">

				<div className="history-bento space-between-btn-4">
					<div className="vstack gap-3 scrollab">
						<div className="finished-games">
							<div className="align-self-center ms-1">
								<Image className="game"
									src={"/assets/svg/pong.svg"}
									width={61}
									height={61}
									alt="Pong logo"
								/>
							</div>
							<div className="align-self-center ms-1">
								<Image className="separator"
									src={"/assets/svg/line.svg"}
									width={1}
									height={66}
									alt="Line"
								/>
							</div>
							<div className="flex-column align-self-center ms-4">
								<div className="usernames">noalexan VS Giuugiu</div>
								<div className="score">10 - 8</div>
							</div>
						</div>
						<div className="finished-games">
							<div className="align-self-center ms-1">
								<Image className="game"
									src={"/assets/svg/pong.svg"}
									width={61}
									height={61}
									alt="Pong logo"
								/>
							</div>
							<div className="align-self-center ms-1">
								<Image className="separator"
									src={"/assets/svg/line.svg"}
									width={1}
									height={66}
									alt="Line"
								/>
							</div>
							<div className="flex-column align-self-center ms-4">
								<div className="usernames">MrVodki VS Nimpô</div>
								<div className="score">10 - 5</div>
							</div>
						</div>
					</div>
				</div>

				<button className="big-button">
					<span className="stroke rainbow-text text-xl">PLAY</span>
				</button>

				<div className="homepage-right-wrapper">
					<div className="profile-bento spaceX-between-btn-2">
						<div className="pfp-ranking">
							<Link href="/profile">
								<div
									className="rounded-circle bg-cover"
									style={{
										backgroundImage: `url("http://${window.location.hostname}:8000${session.avatar}")`,
										backgroundSize: "cover",
										backgroundPosition: "center center",
										backgroundRepeat: "no-repeat",
										width: "70px",
										height: "70px"
									}}
								/>
							</Link>
							<Image priority className="rank"
								src={"/assets/ranking/challenger_1.png"}
								width={31}
								height={31}
								alt="Challenger 1"
							/>
						</div>
						<div className="pseudo-trophy-wrapper truncate">
							<h3 style={{fontSize: "1.5rem", lineHeight: "2rem"}}>{session.display_name}</h3>
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

					<div className="friends-bento">
						<UserSearchBar />
						<FriendsList />
					</div>

				</div>

			</main>
		)
	}

	else {
		{/* ------------------------ NOT CONNECTED ------------------------- */}
		return (
			<main>
				<div className="not-connected-wrapper">
					<div className="row">
						<div className="col-7 col-xl-8 col-xxl-9">
							<h1 className="fw-bold custom-font-size text-light">Welcome</h1>
							<h1 className="fw-bold custom-font-size text-light">to our</h1>
							<h1 className="fw-bold custom-font-size text-light">Final Project.</h1>
						</div>
						<div className="col-5 col-xl-4 col-xxl-3 align-items-center align-self-center mt-5">
							{(process.env.NEXT_PUBLIC_CLIENT_ID && process.env.NEXT_PUBLIC_REDIRECT_URI &&
								<Link href={`https://api.intra.42.fr/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_REDIRECT_URI)}&response_type=code`}>
									<button type="button" className="btn btn-light btn-outline-info btn-with-logo">
										<Image className="logo"
											src="/assets/svg/42-school_logo.svg"
											width={24}
											height={24}
											alt="42 Logo"
										/>
										Continue with 42
									</button>
								</Link>
							) || (
								<button disabled type="button" className="btn btn-light btn-outline-info btn-with-logo">
									Client ID not defined
								</button>
							)}
						</div>
					</div>
				</div>
			</main>
		)
		{/* ---------------------------------------------------------------- */}
	}
}

export default Home
