"use client"

import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { useSession } from "@/providers/Session"

function UserProfile({ params }: { params: { login: string } }): React.JSX.Element {
	const router = useRouter()
	const { session } = useSession()
	const [user, setUser] = useState<User|null>(null)
	const [relation, setRelation] = useState<FriendRequest|null>(null)

	useEffect(() => {
		const handleFetch = async () => {
			const response = await toast.promise(
				fetch(`http://${window.location.hostname}:8000/users/get/?login=${encodeURIComponent(params.login)}`),
				{
					loading: `Fetching user ${params.login}`,
					success: `User ${params.login} fetched`,
					error: `Unable to fetch user ${params.login}`,
				}
			)

			if (response.status != 200) {
				toast.error(`User "${params.login}" doesn"t exist`)
				router.push("/")
			}

			setUser(await response.json())
		}

		handleFetch()
	}, [params, router])

	useEffect(() => {
		if (session && user) {
			const handleFetch = async () => {
				const response = await session.api(`/users/friends/requests/?user_id=${user.id}`)
				const data = await response.json().catch(() => null)
				setRelation(data)
			}

			handleFetch()
		}
	}, [session, user])

	if (user === null) {
		return <p>Loading...</p>
	}

	return (
		<main>
			<div
				className="rounded-circle bg-cover"
				style={{
					backgroundImage: `url("http://${window.location.hostname}:8000${user.avatar}")`,
					backgroundSize: "cover",
					backgroundPosition: "center center",
					backgroundRepeat: "no-repeat",
					width: "200px",
					height: "200px"
				}}
			/>
			{user.display_name}
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
		</main>
	)
}

export default UserProfile
