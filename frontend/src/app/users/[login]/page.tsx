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
	const { session, status } = useSession()
	const [user, setUser] = useState<User>()
	const [friends, setFriends] = useState<User[]>()
	const [receivedFriendRequests, setReceivedFriendRequests] = useState<User[]>()
	const [sentFriendRequests, setSentFriendRequests] = useState<User[]>()

	useEffect(() => {
		if (status == "disconnected") {
			toast.error("You are not connected")
			router.push("/")
		}
	}, [router, status])

	useEffect(() => {
		const handleFetch = async () => {
			const response = await fetch(`https://${window.location.hostname}:8000/users/get/?login=${encodeURIComponent(params.login)}`)

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
		if (session)
		{
			const handleFriendsFetch = async () => {
				const response = await session.api(`/users/friends/?user=${session.id}`)
				
				if (response.ok)
				{
					const data = await response.json().catch(() => null)
					setFriends(data)
				}
			}
			
			handleFriendsFetch()

		}
	}, [session])

	useEffect(() => {
		if (session)
		{
			const handleReceivedFriendRequestsFetch = async () => {
				const response = await session.api(`/users/friends/receivedrequests/`)
				
				if (response.ok)
				{
					const data = await response.json().catch(() => null)
					setReceivedFriendRequests(data)
				}
			}
			
			handleReceivedFriendRequestsFetch()

		}
	}, [session])

	useEffect(() => {
		if (session)
		{
			const handleSentFriendRequestsFetch = async () => {
				const response = await session.api(`/users/friends/sentrequests/`)
				
				if (response.ok)
				{
					const data = await response.json().catch(() => null)
					setSentFriendRequests(data)
				}
			}
			
			handleSentFriendRequestsFetch()

		}
	}, [session])

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
						{
							session && session.id != user.id && (
								<div>
									{
										friends?.find(u => u.id === user.id) && (
											<button
												onClick={
													async () => {
														const response = await session.api("/users/friends/", "DELETE", JSON.stringify({user_id: user.id}))
														if (response.ok) {
															setFriends(list => list?.filter(u => u.id !== user.id))
														}
													}
												}
											>remove</button>
										) || receivedFriendRequests?.find(u => u.id === user.id) && (
											<div>
												<button
													onClick={
														async () => {
															const response = await session.api("/users/friends/", "POST", JSON.stringify({user_id: user.id}))
															if (response.ok) {
																setReceivedFriendRequests(list => list?.filter(u => u.id !== user.id))
																setFriends(list => list ? [...list, user] : [user])
															}
														}
													}
												>accept</button>
												<button
													onClick={
														async () => {
															const response = await session.api("/users/friends/", "DELETE", JSON.stringify({user_id: user.id}))
															if (response.ok) {
																setReceivedFriendRequests(list => list?.filter(u => u.id !== user.id))
															}
														}
													}
												>reject</button>
											</div>
										) || sentFriendRequests?.find(u => u.id === user.id) && (
											<div>
												<button disabled>pending...</button>
												<button
													onClick={
														async () => {
															const response = await session.api("/users/friends/", "DELETE", JSON.stringify({user_id: user.id}))
															if (response.ok) {
																setSentFriendRequests(list => list?.filter(u => u.id !== user.id))
															}
														}
													}
												>cancel</button>
											</div>
										) || (
											<button
												onClick={
													async () => {
														const response = await session.api("/users/friends/", "POST", JSON.stringify({user_id: user.id}))
														if (response.ok) {
															setSentFriendRequests(list => list ? [...list, user] : [user])
														}
													}
												}
											>add</button>
										)
									}
								</div>
							)
						}
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
								placeholder="blur"
								blurDataURL="/assets/ranking/trophy.png"
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
