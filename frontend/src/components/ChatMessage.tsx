"use client"

import React, { useEffect } from "react"
import { useSession } from "@/providers/Session"
import "@/styles/ChatMessage.css"

function Message(
	{
		chat
	}: {
		chat: Chat
	}
): React.JSX.Element
{
	const {session} = useSession()
	const date: Date = new Date(chat.created_at)

	if (chat.sender.id === session?.id)
	{
		return (
			<div className="my-entire-div clearfix">
				<div className="my-message-div">
					{chat.content}
					<p className="my-timestamp">{date.toLocaleDateString() + " " + date.toLocaleTimeString()}</p>
				</div>
				<div className="my-image-div">
					<div
						className="rounded-circle bg-cover"
						style={
							{
								backgroundImage: `url("https://${window.location.hostname}:8000${chat.sender.avatar}")`,
								backgroundSize: "cover",
								backgroundPosition: "center center",
								backgroundRepeat: "no-repeat",
								width: 25,
								height: 25
							}
						}
					/>
				</div>
			</div>
		)
	}
	else
	{
		return (
			<div className="friend-entire-div clearfix">
				<div className="friend-image-div">
					<div
						className="rounded-circle bg-cover"
						style={
							{
								backgroundImage: `url("https://${window.location.hostname}:8000${chat.sender.avatar}")`,
								backgroundSize: "cover",
								backgroundPosition: "center center",
								backgroundRepeat: "no-repeat",
								width: 25,
								height: 25
							}
						}
					/>
				</div>
				<div className="friend-message-div">
					{chat.content}
					<p className="friend-timestamp">{date.toLocaleDateString() + " " + date.toLocaleTimeString()}</p>
				</div>
			</div>
		)
	}
}

export default Message
