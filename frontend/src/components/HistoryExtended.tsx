"use client"

import { useEffect, useState } from "react"

import { useSession } from "@/providers/Session"

import "@/styles/profile/Profile.css"
import Link from "next/link"

function HistoryExtended(): React.JSX.Element {

	const { session } = useSession()

	const [Game, setGames] = useState<Game[]>()

	useEffect(() => {
		const fetchStats = async () => {

			const response = await session?.api("/game")
			if (response?.ok) {
				const data = await response.json()
				setGames(data)
			}
		}

		fetchStats()
	}, [])

	const formatDateTime = (datetime: string) => {
		const date = new Date(datetime)
		const options: Intl.DateTimeFormatOptions = {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		}
		return date.toLocaleDateString(undefined, options)
	}

	return (
		<>
			{Game?.map((stat, index) => {
				const isPlayer1 = stat.player_1.login === session?.login
				const isVictory = isPlayer1 ? (stat.score1 > stat.score2) : (stat.score2 > stat.score1)
				const formattedDateTime = formatDateTime(stat.created_at)

				return(
					<div className="finished-games" key={index}
					style={{
						flexDirection: "row",
						alignItems: "center",
						backgroundColor:
							isVictory
							? "rgba(86, 174, 87, 1)"
							: "rgba(190, 23, 15, 1)",
					}}>
						<div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
							<div
								className="rounded-circle bg-cover"
								style={{
									backgroundImage: `url("https://${window.location.hostname}:8000${stat.player_1.avatar}")`,
									backgroundSize: "cover",
									backgroundPosition: "center center",
									backgroundRepeat: "no-repeat",
									width: "75px",
									height: "75px"
								}}
							/>
							<Link href={`/users/${stat.player_1.login}`}>
								<div className="login-name" style={{marginTop: "0.5rem"}}>
									<p>{stat.player_1.display_name}</p>
								</div>
							</Link>
						</div>

						<div className="bubble-info"
						style={{
							backgroundColor: isVictory
							? "rgba(10, 167, 10, 1)"
							: "rgba(255, 0, 0, 1)",
						}}>
							<div>
								{isVictory ? (
									<h2>VICTOIRE</h2>
								) : (
									<h2>DÉFAITE</h2>
								)}
							</div>

							<p>
								{formattedDateTime}
							</p>

							<h1>
								{stat.score1}
								{" - "}
								{stat.score2}
							</h1>
						</div>

						<div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
							<div
								className="rounded-circle bg-cover"
								style={{
									backgroundImage: `url("https://${window.location.hostname}:8000${stat.player_2.avatar}")`,
									backgroundSize: "cover",
									backgroundPosition: "center center",
									backgroundRepeat: "no-repeat",
									width: "75px",
									height: "75px"
								}}
							/>
							<Link href={`/users/${stat.player_2.login}`}>
								<div className="login-name" style={{marginTop: "0.5rem"}}>
									<p>{stat.player_2.display_name}</p>
								</div>
							</Link>
						</div>
					</div>
				)
			})}
		</>
	)
}

export default HistoryExtended
