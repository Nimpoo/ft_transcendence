"use client"

import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import "@/styles/profile/Profile.css"
import { useSession } from "@/providers/Session"
import Loading from "@/app/loading"
import CountUp from "react-countup"
import Image from "next/image"
import FriendsList from "@/components/FriendsList"
import HistoryExtended from "@/components/HistoryExtended"

function UserProfile({ params }: { params: { login: string } }): React.JSX.Element {
	const router = useRouter()
	const { session } = useSession()
	const [user, setUser] = useState<User>()
	const [relation, setRelation] = useState<FriendRequest>()

	useEffect(() => {
		const handleFetch = async () => {
			const response = await toast.promise(
				fetch(`https://${window.location.hostname}:8000/users/get/?login=${encodeURIComponent(params.login)}`),
				{
					loading: `Fetching user ${params.login}`,
					success: `User ${params.login} fetched`,
					error: `Unable to fetch user ${params.login}`,
				}
			)

			if (response.ok)
			{
				setUser(await response.json())
			}
			else
			{
				toast.error(`User "${params.login}" doesn"t exist`)
				router.push("/")
			}
		}

		handleFetch()
	}, [params, router])

	useEffect(() => {
		if (session && user)
		{
			const handleFetch = async () => {
				const response = await session.api(`/users/friends/requests/?user=${user.id}`)

				if (response.ok)
				{
					const data = await response.json().catch(() => null)
					setRelation(data)
				}
			}

			handleFetch()
		}
	}, [session, user])

	if (user == undefined) {
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
								backgroundImage: `url("https://${window.location.hostname}:8000${user.avatar}")`,
								backgroundSize: "cover",
								backgroundPosition: "center center",
								backgroundRepeat: "no-repeat",
								width: "200px",
								height: "200px"
							}}
						/>
						<h1 style={{fontSize: "1.875rem", lineHeight: "2.25rem", marginTop: "0.75rem"}}>{user.display_name}</h1>
						{session && session.id != user.id && (
						<div>
							{relation &&
								(
									relation.status === "pending" && ( // ? Is there a pending request
										relation.sender === session.id && ( // ? Did I sent
											<div>
												<button disabled>pending...</button>
												<button onClick={async () => setRelation(await (await session.api("/users/friends/", "DELETE", JSON.stringify({user_id: user.id}))).json())}>cancel</button>
											</div>
										) || (
											<div>
												<button onClick={async () => setRelation(await (await session.api("/users/friends/", "POST", JSON.stringify({user_id: user.id}))).json())}>accept</button>
												<button onClick={async () => setRelation(await (await session.api("/users/friends/", "DELETE", JSON.stringify({user_id: user.id}))).json())}>reject</button>
											</div>
										)
									) || relation.status === "accepted" && ( // ? Is he my friend ?
										<button onClick={async () => setRelation(await (await session.api("/users/friends/", "DELETE", JSON.stringify({user_id: user.id}))).json())}>remove</button>
									)
								) || (
									<button onClick={async () => setRelation(await (await session.api("/users/friends/", "POST", JSON.stringify({user_id: user.id}))).json())}>add</button>
								)
							}
						</div>
					)}
					</div>
				</div>

				<div className="bento" style={{height: "48%"}}>
					<div className="stats-wrapper">
						<div className="trophies-ranking">
							<CountUp duration={5} className="trophies-number truncate" end={user.trophies} />
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
						<CountUp duration={5} className="truncate" end={user.highest_trophies} />
					</div>

					<div className="stats-info">
						<span>Games played</span>
						<CountUp duration={5} className="truncate" end={user.games_played} />
					</div>

					<div className="stats-info" style={{color: "rgb(34 197 94)"}}>
						<span>Victories</span>
						<CountUp duration={5} className="truncate" end={user.victories} />
					</div>

					<div className="stats-info" style={{color: "rgb(239 68 68)"}}>
						<span>Defeats</span>
						<CountUp duration={5} className="truncate" end={user.defeats} />
					</div>
				</div>

			</div>

			<div className="bento" style={{width: "620px", overflowY: "scroll"}}>
				<HistoryExtended user={user} />
			</div>

			<div className="bento" style={{width: "310px"}}>
				<FriendsList user={user} />
			</div>
		</main>
	)
}

export default UserProfile
