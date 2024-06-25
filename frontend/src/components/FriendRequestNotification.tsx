"use client"

import { useSession } from "@/providers/Session"
import toaster, { Toast } from "react-hot-toast"

function FriendRequestNotifications({
	sender,
	toast,
}: {
	sender: User,
	toast: Toast,
})
{
	const { session } = useSession()

	return (
		<span>
			Friend Request from {sender.display_name}

			<div className="btn-group">
				<button
					onClick={
						function()
						{
							session?.api("/users/friends/", "POST", JSON.stringify({user_id: sender.id}))
							toaster.dismiss(toast.id)
						}
					}
				>
					accept
				</button>
				<button
					onClick={
						function()
						{
							session?.api("/users/friends/", "DELETE", JSON.stringify({user_id: sender.id}))
							toaster.dismiss(toast.id)
						}
					}
				>
					reject
				</button>
			</div>

			<button onClick={() => toaster.dismiss(toast.id)}>
				X
			</button>

		</span>
	)
}

export default FriendRequestNotifications
