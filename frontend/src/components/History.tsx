"use client"

import { useEffect, useState } from "react"

import { useSession } from "@/providers/Session";

import Image from "next/image"

import "@/styles/Homepage.css"
import Link from "next/link";

function History(): React.JSX.Element {

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

	return (
		<>
			{Game?.map((stat, index) => (
				<div className="finished-games" key={index}>
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
			))}
		</>
	)
}

export default History
