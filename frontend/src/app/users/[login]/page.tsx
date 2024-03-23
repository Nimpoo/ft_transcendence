"use client"

import { useSession } from "@/providers/Session"
import { useRouter } from "next/navigation"
import { use, useEffect, useState } from "react"
import toast from "react-hot-toast"

function UserProfile({ params }: { params: { login: string } }): React.JSX.Element {
	const router = useRouter()
	const { session } = useSession()
	const [user, setUser] = useState<User|null>(null)
	const [relation, setRelation] = useState<FriendRequest|null>(null)

	useEffect(() => {
		const handleFetch = async () => {
			const response = await toast.promise(
				fetch(`/api/users/get?login=${encodeURIComponent(params.login)}`),
				{
					loading: `Fetching user ${params.login}`,
					success: `User ${params.login} fetched`,
					error: `Unable to fetch user ${params.login}`,
				}
			)

			if (response.status != 200) {
				toast.error(`User '${params.login}' doesn't exist`)
				router.push("/")
			}

			setUser(await response.json())
		}

		handleFetch()
	}, [params, router])

	useEffect(() => {
		if (session && user) {
			const handleFetch = async () => {
				const response = await session.api(`/users/friends/get?id=${user.id}`)
				response.json().then(data => setRelation(data)).catch(error => setRelation(null))
			}

			handleFetch()
		}
	}, [session, user])

	if (user === null) {
		return <p>Loading...</p>
	}

	return (
		<main>
			{user.display_name}
			{session && session.id != user.id && (
				<div>
					{relation &&
						(
							relation.status === "pending" && ( // ? Is there a pending request
								relation.sender === session.id && ( // You sent
									<button disabled>pending...</button>
								) || ( // You received
									<div>
										<button onClick={async () => setRelation(await (await session.api("/users/friends/add", "POST", JSON.stringify({user_id: user.id}))).json())}>accept</button>
										<button onClick={async () => setRelation(await (await session.api("/users/friends/reject", "POST", JSON.stringify({user_id: user.id}))).json())}>reject</button>
									</div>
								)
							) || relation.status === "accepted" && ( // ? Is he my friend ?
								<button onClick={async () => setRelation(await (await session.api("/users/friends/remove", "POST", JSON.stringify({user_id: user.id}))).json())}>remove</button>
							)
						) || ( // else
							<button onClick={async () => setRelation(await (await session.api("/users/friends/add", "POST", JSON.stringify({user_id: user.id}))).json())}>add</button>
						)
					}
				</div>
			)}
		</main>
	)
}

export default UserProfile
