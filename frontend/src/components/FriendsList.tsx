import { useSession } from "@/providers/Session"
import Link from "next/link"
import toast from "react-hot-toast"

function FriendsList(): React.JSX.Element {
	const { session } = useSession()

	if (session) {
		const FriendsListItem = ({ user, index }: { user: User, index: number }): React.JSX.Element => {
			const handleRemove = () => {
				session.api("/users/friends/remove", "POST", JSON.stringify({ user_id: user.id })).catch(() => toast.error('Remove failed, try again'))
				session.friends = session.friends.slice(index, index)
			}

			const handleBlock = () => {
				session.api("/chat/block", "POST", JSON.stringify({ user_id: user.id })).catch(() => toast.error('Remove failed, try again'))
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
				{session.friends.map((friend, key) => <FriendsListItem key={key} user={friend} index={key} />)}
			</ul>
		)
	}

	else
		return <></>
}

export default FriendsList
