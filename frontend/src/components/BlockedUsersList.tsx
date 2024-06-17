"use client"

import { useModal } from "@/providers/Modal"
import { useSession } from "@/providers/Session"
import Link from "next/link"
import { useEffect, useState } from "react"

function BlockedUsersList(): React.JSX.Element
{
	const {session} = useSession()
	const {clearModal} = useModal()
	const [blockedUsers, setBlockedUsers] = useState<User[]>()

	useEffect(
		function()
		{
			const fetchBlockedUser = async () => {
				const response = await session?.api("/chat/block/")
				if (response?.ok)
					setBlockedUsers(await response.json())
			}

			fetchBlockedUser()
		},
		[session]
	)

	return (
		<ul
			className="p-0 list-unstyled w-100"
		>
			{blockedUsers?.map((user, key) => (
				<div
					key={key}
					className="d-flex flex-row align-items-center"
				>
					<Link
						href={"/users/" + user.login}
						className="d-flex flex-row flex-grow-1 align-items-center text-black"
						onClick={() => clearModal()}
					>
						<div
							className="rounded-circle bg-cover me-3"
							style={{
								backgroundImage: `url("https://${window.location.hostname}:8000${user.avatar}")`,
								backgroundSize: "cover",
								backgroundPosition: "center center",
								backgroundRepeat: "no-repeat",
								width: 50,
								height: 50
							}}
						/>
						{user.display_name}
					</Link>
					<button
						className="btn btn-danger"
						onClick={
							function()
							{
								session?.api("/chat/block/", "DELETE", JSON.stringify({user_id: user.id}))
								setBlockedUsers(undefined)
							}
						}
					>unblock</button>
				</div>
			))}
		</ul>
	)
}

export default BlockedUsersList
