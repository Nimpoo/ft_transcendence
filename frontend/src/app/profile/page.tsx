"use client"

import Image from "next/image"
import CountUp from "react-countup"

import "bootstrap/dist/css/bootstrap.css"
import "@/styles/global.css"
import "@/styles/profile/Profile.css"

function Profile(): React.JSX.Element {
	return (
		<main className="profilepage-wrapper">
			<div className="pfp-stats-wrapper">

				<div className="bento" style={{height: "48%"}}>
					<div className="default-wrapper">
						<Image style={{borderRadius: "9999px"}} priority
							src={"https://thispersondoesnotexist.com"}
							width={200}
							height={200}
							alt="Your profile picture"
						/>
						<h1 style={{fontSize: "1.875rem", lineHeight: "2.25rem", marginTop: "0.75rem"}}>Nimpô</h1>
					</div>
				</div>

				<div className="bento" style={{height: "48%"}}>
					<div className="stats-wrapper">
						<div className="trophies-ranking">
							<CountUp duration={5} className="trophies-number truncate" end={0} />
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
						<CountUp duration={5} className="truncate" end={0} />
					</div>

					<div className="stats-info">
						<span>Games played</span>
						<CountUp duration={5} className="truncate" end={0} />
					</div>

					<div className="stats-info" style={{color: "rgb(34 197 94)"}}>
						<span>Victories</span>
						<CountUp duration={5} className="truncate" end={0} />
					</div>

					<div className="stats-info" style={{color: "rgb(239 68 68)"}}>
						<span>Defeats</span>
						<CountUp duration={5} className="truncate" end={0} />
					</div>
				</div>

			</div>

			<div className="bento" style={{width: "620px"}}>
				{/* HISTORY GAMES */}
			</div>

			<div className="bento" style={{width: "310px"}}>
				{/* FRIENDS */}
			</div>
		</main>
	)
}

export default Profile
