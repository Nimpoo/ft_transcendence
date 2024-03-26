import { useSession } from "@/providers/Session"
import Link from "next/link"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

function FriendRequestsList(): React.JSX.Element {
	const { session } = useSession()
	const [friendRequestsList, setFriendsList] = useState<User[]>([])

	useEffect(() => {
		if (session) {
			const fetchFriendRequestsList = async () => {
				const response = await session.api(`/users/friends/requests`)
				const data = await response.json()
				setFriendsList(data)
			}

			fetchFriendRequestsList().catch(e => toast.error("Something went wrong. Try again later"))
		}
	}, [session])

	if (session) {
		const FriendRequestsListItem = ({ user, index }: { user: User, index: number }): React.JSX.Element => {
			const handleAdd = () => {
				session.api("/users/friends", "POST", JSON.stringify({ user_id: user.id })).catch(() => toast.error('Add failed, try again'))
				setFriendsList(friendRequestsList.slice(index, index))
			}

			const handleReject = () => {
				session.api("/users/friends", "DELETE", JSON.stringify({ user_id: user.id })).catch(() => toast.error('Rejct failed, try again'))
				setFriendsList(friendRequestsList.slice(index, index))
			}

			return (
				<li style={{display: "flex", flexDirection: "column"}}>
					<Link href={`/users/${user.login}`}>
						<h5>{user.login}</h5>
					</Link>
					<div className="btn-group">
						<button className="btn btn-success" onClick={handleAdd}>add</button>
						<button className="btn btn-danger" onClick={handleReject}>reject</button>
					</div>
				</li>
			)
		}

		return (
			<ul className="list-unstyled">
				{friendRequestsList.map((friend, key) => <FriendRequestsListItem key={key} user={friend} index={key} />)}
			</ul>
		)
	}

	else
		return <></>
}

export default FriendRequestsList
