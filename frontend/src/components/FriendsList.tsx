import { useSession } from "@/providers/Session"
import Link from "next/link"
import { useEffect, useState } from "react"

function FriendsList(): React.JSX.Element {
	const { session } = useSession()
	const [friends, setFriends] = useState<User[]>([])

	useEffect(() => {
		if (session) {

			const fetchFriendsList = async () => {
				const response = await session.api(`/users/friends/${session.id}`)
				setFriends(await response.json())
			}

			fetchFriendsList()
		}
	}, [session])

	function FriendsListItem({ user }: { user: User }): React.JSX.Element {
		console.log(user)

		const handleRemove = () => {
			session?.api("/users/friends/remove", "POST", JSON.stringify({ user_id: user.id })).catch(console.error)
		}

		const handleBlock = () => {
			session?.api("/chat/block", "POST", JSON.stringify({ user_id: user.id })).catch(console.error)
		}

		return (
			<li style={{display: "flex", flexDirection: "column"}}>
				<Link href={`/users/${user.login}`}>
					<div></div>
					<div>
						<h5>{user.login}</h5>
						<button onClick={handleRemove}>remove</button>
						<button onClick={handleBlock}>block</button>
					</div>
				</Link>
			</li>
		)
	}

	return <ul className="list-unstyled">{friends.map((friend, key) => <FriendsListItem key={key} user={friend} />)}</ul>
}

export default FriendsList
