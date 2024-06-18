"use client"

import { useEffect, useState } from "react"

import { useSession } from "@/providers/Session"
import Loading from "@/app/loading"

import Image from "next/image"

import "@/styles/Homepage.css"
import Link from "next/link"
import toast from "react-hot-toast"

function History(): React.JSX.Element {

	const { session } = useSession()

	const [Game, setGames] = useState<Game[]>()

	useEffect(() => {
		if (session)
		{
			const fetchStats = async () => {
				const response = await toast.promise(
					fetch(`https://${window.location.hostname}:8000/game/?user=${session?.id}`),
					{
						loading: `Fetching /game/?user=${session?.id}`,
						success: `/game/?user=${session?.id} fetched`,
						error: `Unable to fetch /game/?user=${session?.id}`
					}
				)

				if (response?.ok) {
					const data = await response.json()
					setGames(data)
				}
			}

			fetchStats()
		}
	}, [])

	return (
		<>
			{Game ? (
				Game?.length ? (
					Game?.map((stat, index) => (
						<div className="finished-games-small" key={index}>
							<div className="align-self-center ms-1">
								<Image className="game_past"
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
							<div className="usernames">
								<p>
									<Link href={`/users/${stat.player_1.login}`}>
										{stat.player_1.display_name}
									</Link>
									{" - "}
									<Link href={`/users/${stat.player_2.login}`}>
										{stat.player_2.display_name}
									</Link>
								</p>
							</div>
								<div className="score">{stat.score1} - {stat.score2}</div>
							</div>
						</div>
					))
				) : (
					<div style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						height: "100%",
					}}>
						<p>No game played.</p>
					</div>
				)) : (
					<Loading />
				)
			}
		</>
	)
}

export default History
