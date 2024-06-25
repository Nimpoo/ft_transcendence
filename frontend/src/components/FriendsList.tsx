"use client"

import Link from "next/link"
import toast from "react-hot-toast"
import { useEffect, useState } from "react"

import { useSession } from "@/providers/Session"
import Loading from "@/app/loading"


function FriendsList({
	user
}: {
	user?: User
}): React.JSX.Element
{
	const { session } = useSession()

	const [friendsList, setFriendsList] = useState<User[]>()
	const [friendRequestsList, setFriendRequestsList] = useState<User[]>()

	useEffect(() => {
		if (user)
		{
			const fetchFriendsList = async () => {
				const response = await fetch(`https://${window.location.hostname}:8000/users/friends/?user=${user.id}`)

				if (response.ok)
				{
					const data = await response.json()
					setFriendsList(data)
					setFriendRequestsList([])
				}
			}

			fetchFriendsList().catch(e => toast.error("Something went wrong. Try again later"))
		}
		else if (session)
		{
			const fetchFriendRequestsList = async () => {
				const response = await session.api("/users/friends/receivedrequests/")
				if (response.ok)
				{
					const data = await response.json()
					setFriendRequestsList(data)
				}
			}

			const fetchFriendsList = async () => {
				const response = await session.api(`/users/friends/?user=${session.id}`)
				if (response.ok)
				{
					const data = await response.json()
					setFriendsList(data)
				}
			}

			fetchFriendRequestsList().catch(e => toast.error("Something went wrong. Try again later"))
			fetchFriendsList().catch(e => toast.error("Something went wrong. Try again later"))
		}
	}, [user, session])

	const FriendsListItem = ({ friend, index }: { friend: User, index: number }): React.JSX.Element => {
		const [online, setOnline] = useState<boolean>()

		useEffect(() => {
			fetch(`https://${window.location.hostname}:8000/users/online/?user=${friend.id}`)
				.then(response => response.json())
				.then(data => setOnline(data["online"]))
		}, [friend])

		const handleRemove = () => {
			session?.api("/users/friends/", "DELETE", JSON.stringify({ user_id: friend.id }))
				.catch(() => toast.error("Remove failed, try again"))
				.then(() => setFriendsList(list => list?.filter((_, i) => i !== index)))
		}

		return (
			<li style={{display: "flex", flexDirection: "row"}}>
				<div
					className="rounded-circle bg-cover m-2"
					style={
						{
							backgroundImage: `url("https://${window.location.hostname}:8000${friend.avatar}")`,
							backgroundSize: "cover",
							backgroundPosition: "center center",
							backgroundRepeat: "no-repeat",
							width: 70,
							height: 70
						}
					}
				/>
				<div>
					<Link href={`/users/${friend.login}`}>
						<h5>{friend.display_name}</h5>
					</Link>
					<h6>{online != undefined && (online ? "online" : "offline")}</h6>
					{(user == undefined || user.id == session?.id) &&
						<button className="btn btn-danger" onClick={handleRemove}>remove</button>
					}
				</div>
			</li>
		)
	}

	const FriendRequestsListItem = ({ user, index }: { user: User, index: number }): React.JSX.Element => {
		const handleAdd = () => {
			session?.api("/users/friends/", "POST", JSON.stringify({ user_id: user.id }))
				.then(() => setFriendRequestsList(list => list?.filter((_, i) => i !== index)))
				.catch(() => toast.error("Add failed, try again"))
		}

		const handleReject = () => {
			session?.api("/users/friends/", "DELETE", JSON.stringify({ user_id: user.id }))
				.then(() => setFriendRequestsList(list => list?.filter((_, i) => i !== index)))
				.catch(() => toast.error("Rejct failed, try again"))
		}

		return (
			<li style={{display: "flex", flexDirection: "row"}}>
				<div
					className="rounded-circle bg-cover m-2"
					style={
						{
							backgroundImage: `url("https://${window.location.hostname}:8000${user.avatar}")`,
							backgroundSize: "cover",
							backgroundPosition: "center center",
							backgroundRepeat: "no-repeat",
							width: 70,
							height: 70
						}
					}
				/>
				<div>
					<Link href={`/users/${user.login}`}>
						<h5>{user.display_name}</h5>
					</Link>
					<div className="btn-group">
						<button className="btn btn-success" onClick={handleAdd}>add</button>
						<button className="btn btn-danger" onClick={handleReject}>reject</button>
					</div>
				</div>
			</li>
		)
	}

	if (friendsList == undefined || friendRequestsList == undefined)
	{
		return <Loading />
	}

	return (
		<ul className="list-unstyled">
			{friendRequestsList.map((friend, key) => <FriendRequestsListItem key={key} user={friend} index={key} />)}
			{friendRequestsList.length != 0 && <hr />}
			{friendsList.map((friend, key) => <FriendsListItem key={key} friend={friend} index={key} />)}
		</ul>
	)
}

export default FriendsList
