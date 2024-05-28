"use client"

import Image from "next/image"
import CountUp from "react-countup"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { useSession } from "@/providers/Session"

import "@/styles/profile/Profile.css"
import FriendsList from "@/components/FriendsList"
import Loading from "../loading"

function Profile(): React.JSX.Element {
	const router = useRouter()
	const { session, status } = useSession()

	useEffect(() => {
		if (status == "disconnected") {
			toast.error("You are not connected")
			router.push("/")
		}
	}, [router, status])

	if (session == null || status != "connected") {
		return <Loading />
	}

	return (
		<main className="profilepage-wrapper">
			<div className="pfp-stats-wrapper">

				<div className="bento" style={{height: "48%"}}>
					<div className="default-wrapper">
						<div
							className="rounded-circle bg-cover"
							style={{
								backgroundImage: `url("https://${window.location.hostname}:8000${session.avatar}")`,
								backgroundSize: "cover",
								backgroundPosition: "center center",
								backgroundRepeat: "no-repeat",
								width: "200px",
								height: "200px"
							}}
						/>
						<h1 style={{fontSize: "1.875rem", lineHeight: "2.25rem", marginTop: "0.75rem"}}>{session.display_name}</h1>
					</div>
				</div>

				<div className="bento" style={{height: "48%"}}>
					<div className="stats-wrapper">
						<div className="trophies-ranking">
							<CountUp duration={5} className="trophies-number truncate" end={session.trophies} />
							<Image priority
								src={"/assets/ranking/trophy.png"}
								width={72}
								height={72}
								alt="Trophy"
							/>
						</div>
						<div className="trophies-ranking" style={{marginTop: "0.25rem"}}>
						<h3 className="ranking-ladder">Challenger - I</h3>
						<Image priority
							src={"/assets/ranking/challenger_1.png"}
							width={45}
							height={45}
							alt="Challenger - I"
						/>
						</div>
					</div>

					<hr style={{marginTop: "1rem", marginBottom: "1rem"}} />

					<div className="stats-info">
						<div style={{display: "flex", alignItems: "center"}}>
							<span style={{paddingRight: "0.5rem"}}>Highest Trophies</span>
							<Image priority
								src={"/assets/ranking/trophy.png"}
								width={28}
								height={28}
								alt="Trophy"
							/>
						</div>
						<CountUp duration={5} className="truncate" end={session.highest_trophies} />
					</div>

					<div className="stats-info">
						<span>Games played</span>
						<CountUp duration={5} className="truncate" end={session.games_played} />
					</div>

					<div className="stats-info" style={{color: "rgb(34 197 94)"}}>
						<span>Victories</span>
						<CountUp duration={5} className="truncate" end={session.victories} />
					</div>

					<div className="stats-info" style={{color: "rgb(239 68 68)"}}>
						<span>Defeats</span>
						<CountUp duration={5} className="truncate" end={session.defeats} />
					</div>
				</div>

			</div>

			<div className="bento" style={{width: "620px"}}>
				{/* HISTORY GAMES */}
			</div>

			<div className="bento" style={{width: "310px"}}>
				<FriendsList />
			</div>
		</main>
	)
}

export default Profile
