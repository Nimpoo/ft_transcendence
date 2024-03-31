"use client"

import Link from "next/link"
import toast from "react-hot-toast"
import { useEffect, useState } from "react"

import { useSession } from "@/providers/Session"

function FriendsList(): React.JSX.Element {
	const { session } = useSession()
	const [friendsList, setFriendsList] = useState<User[]>([])

	useEffect(() => {
		if (session) {
			const fetchFriendsList = async () => {
				const response = await session.api(`/users/friends`)
				const data = await response.json()
				setFriendsList(data)
			}

			fetchFriendsList().catch(e => toast.error("Something went wrong. Try again later"))
		}
	}, [session])

	const FriendsListItem = ({ user, index }: { user: User, index: number }): React.JSX.Element => {
		const handleRemove = () => {
			session?.api("/users/friends", "DELETE", JSON.stringify({ user_id: user.id }))
				.catch(() => toast.error('Remove failed, try again'))
				.then(() => setFriendsList(friendsList.slice(index, index)))
		}

		const handleBlock = () => {
			session?.api("/chat/block", "POST", JSON.stringify({ user_id: user.id }))
				.catch(() => toast.error('Remove failed, try again'))
				.then(() => setFriendsList(friendsList.slice(index, index)))
		}

		return (
			<li style={{display: "flex", flexDirection: "column"}}>
				<Link href={`/users/${user.login}`}>
					<h5>{user.login}</h5>
				</Link>
				<div className="btn-group">
					<button className="btn btn-success" onClick={handleRemove}>remove</button>
					<button className="btn btn-danger" onClick={handleBlock}>block</button>
				</div>
			</li>
		)
	}

	return (
		<ul className="list-unstyled">
			{friendsList.map((friend, key) => <FriendsListItem key={key} user={friend} index={key} />)}
		</ul>
	)
}

export default FriendsList
