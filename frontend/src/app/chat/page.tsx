"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { useSession } from "@/providers/Session"
import { useSocket } from "@/providers/Socket"
import ChatMessage from "@/components/ChatMessage"
import Loading from "../loading"

import "@/styles/Chat.css"
import toast from "react-hot-toast"


function Chat(): React.JSX.Element {
	const {session, status} = useSession()

	const router = useRouter()
	const socket = useSocket()

	const [search, setSearch] = useState<string>()
	const searchTimeout = useRef<NodeJS.Timeout>()
	const [results, setResults] = useState<User[]>()

	const [conversations, setConversations] = useState<Chat[]>()
	const [selectedConversation, setSelectedConversation] = useState<User>()
	const chatContainerRef = useRef<HTMLDivElement>(null)
	const [messages, setMessages] = useState<Chat[]>()

	useEffect(() => {
		if (status == "disconnected") {
			toast.error("You are not connected")
			router.push("/")
		}
	}, [router, status])

	useEffect(() => {
		if (session && conversations === undefined)
		{
			const getAllConv = async () => {
				const response = await session.api("/chat/getconvs/").catch(console.error)

				if (response?.ok)
				{
					const data = await response.json()
					setConversations(data)
				}
			}

			getAllConv()
		}
		else
			console.log(conversations)
	}, [session, conversations])

	useEffect(() => {
		if (socket)
		{
			socket.onmessage = event => {
				let data

				try
				{
					data = JSON.parse(event.data)
				}
				catch (e)
				{
					console.error(e)
					return
				}

				if (data.type === "message.sent" || data.type === "message.receive")
				{
					let chat = data.message
					setMessages(messages => messages ? [...messages, chat] : [chat])
					
					const existingConv = conversations?.find(
						(conv) =>
							(conv.sender.id === chat.sender.id && conv.receiver.id === chat.receiver.id) ||
						(conv.sender.id === chat.receiver.id && conv.receiver.id === chat.sender.id)
					);

					if (!existingConv) {
						const newConv: Chat = {
							id: chat.id,
							sender: chat.sender,
							receiver: chat.receiver,
							content: chat.content,
							created_at: chat.created_at,
						};

						setConversations((conversations) => [...(conversations || []), newConv]);
					}
				}
			}
		}
	}, [session, socket, selectedConversation, conversations]);

	useEffect(() => {
		if (chatContainerRef.current)
		{
			chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
		}
	}, [messages])

	useEffect(() => {
		const userSearch = async () => {
			if (search)
			{
				const response = await fetch(`https://${window.location.hostname}:8000/users/search?q=${encodeURIComponent(search)}`)

				if (response?.ok)
				{
					const data = await response.json()
					setResults(data)
				}

				clearTimeout(searchTimeout.current)
			}
			else
			{
				setResults(undefined)
			}
		}

		if (searchTimeout.current)
		{
			clearTimeout(searchTimeout.current)
		}

		searchTimeout.current = setTimeout(userSearch, 500)
	}, [search])

	useEffect(() => {
		if (selectedConversation)
		{
			const getChatByUser = async (user: User) => {
				const response = await session?.api(`/chat/getconv/?user=${user.id}`)

				if (response?.ok)
				{
					const data = await response.json()
					setMessages(data)
				}
			}

			getChatByUser(selectedConversation)
		}
	}, [session, selectedConversation])

	if (status === "loading" || session === null)
	{
		return <Loading />
	}

	const handleClick = (user: User) => {
		setSelectedConversation(user.id === selectedConversation?.id ? undefined : user)
		setSearch("")
		setMessages(undefined)
	}

	const handleMessageSend = (event: React.FormEvent) => {
		event.preventDefault()

		if (socket && selectedConversation)
		{
			const form = event.target as HTMLFormElement
			const msg = form.msg

			if (msg.value.trim()) {
				socket.send(
					JSON.stringify(
						{
							"type": "message.send",
							"target_id": selectedConversation.id,
							"content": msg.value,
						}
					)
				)
			}

			msg.value = ""
		}
	}

	return (
		<div className="chat-wrapper">
			<div className="row">
				<div className="col-4 box-1-wrap">
					<div className="row box-1-title">
						<div className="col-9 mt-3">
							<p className="font-conv-size">Conversations</p>
						</div>
						<div className="col-3 mt-3">
							<button type="button" className="btn" onClick={() => setSelectedConversation(undefined)}>
								<Image className="img-chat"
									src={"/assets/svg/Cross.svg"}
									width={25}
									height={25}
									alt="Cross"
								/>
							</button>
						</div>
					</div>
					<div className="vstack gap-3 scrollab">
						{
							conversations &&
							conversations.map(
								(conv, key) => {
									const crspdt = conv.sender.id === session.id ? conv.receiver : conv.sender

									return (
										<div key={key}>
											<input type="checkbox" className="btn-check" name={`conv-${crspdt.login}`} id={`btnconv-${crspdt.login}`} autoComplete="on" checked={selectedConversation?.id === crspdt.id} />
											<label className="btn btn-outline-dark btn-1-conv" htmlFor={`btnconv-${crspdt.login}`} onClick={() => handleClick(crspdt)}>
												<div
													className="rounded-circle bg-cover"
													style={
														{
														backgroundImage: `url("https://${window.location.hostname}:8000${crspdt.avatar}")`,
														backgroundSize: "cover",
														backgroundPosition: "center center",
														backgroundRepeat: "no-repeat",
														width: 60,
														height: 60
														}
													}
												/>
												<div>
													<h5 className="text-place">{crspdt.display_name}</h5>
													<div className="text-truncate change-trunc">
														{conv.content}
													</div>
												</div>
											</label>
										</div>
									)
								}
							) || <Loading />
						}
					</div>
				</div>
				<div className="col-8 ms-3 box-2-wrap">
					{
						selectedConversation && (
							<div>
								<div className="row box-2-title rounded-bottom-0">
									<ul style={{display: "flex", width: "880px", height: "65px"}} className="list-inline">
										<li className="list-inline-item" style={{marginTop: "3px"}}>
												<div
													className="rounded-circle bg-cover"
													style={
														{
															backgroundImage: `url("https://${window.location.hostname}:8000${selectedConversation.avatar}")`,
															backgroundSize: "cover",
															backgroundPosition: "center center",
															backgroundRepeat: "no-repeat",
															width: 60,
															height: 60
														}
													}
												/>
										</li>
										<li className="list-inline-item">
											<Link href={`/users/${selectedConversation.login}`}>
												<h5 className="conv-name">{selectedConversation.display_name}</h5>
											</Link>
										</li>
										<li className="list-inline-item">
											<button
												type="button"
												className="btn btn-danger btn-place"
												onClick={
													function()
													{
														session.api(
															"/chat/block/",
															"POST",
															JSON.stringify(
																{
																	user_id: selectedConversation.id
																}
															)
														)
														setConversations(
															conversations => conversations?.filter(
																c => c.sender.id == session.id ? c.receiver.id != selectedConversation.id : c.sender.id != selectedConversation.id
															)
														)
														setSelectedConversation(undefined)
													}
												}
											>
												Block
											</button>
										</li>
									</ul>
								</div>
								<div className="conv-box" ref={chatContainerRef}>
									{
										messages?.map((chat, index) => <ChatMessage key={index} chat={chat} />) || <Loading />
									}
								</div>
								<form className="input-group" onSubmit={handleMessageSend}>
									<input className="form-control text-box-style" name="msg" type="text" id="input" placeholder="New message" aria-label="enter message with one button add-on" aria-describedby="button-send" autoComplete="off" />
									<button className="btn btn-text-style btn-light" type="submit" id="button-send">
										<Image className="img-chat"
											src={"/assets/svg/Send-logo.svg"}
											width={21}
											height={22}
											alt="Send"
										/>
									</button>
								</form>
							</div>
						) || (
							<div>
								<div className="row box-2-title rounded-bottom-0">
									<input className="form-control input-style rounded-bottom-0 rounded-start-0" type="text" placeholder="Enter name(s) to start to chat..." aria-label="start chat" onChange={e => setSearch(e.target.value)} />
									{
										results &&
										<ul className="ulSearchBar list-group">
											{
												results.map(
													(user, key) => {
														if (session.id === user.id)
														{
															return <></>
														}

														return (
															<li className="liSearchBar list-group-item" key={key}>
																<Link onClick={() => handleClick(user)} href="#">
																	<a className="aSearchBar">{user.display_name}</a>
																</Link>
															</li>
														)
													}
												)
											}
										</ul>
									}
								</div>
								<div className="conv-box" />
								<div className="input-group">
									<input className="form-control text-box-style" type="text" placeholder="New message" aria-label="enter message with one button add-on" aria-describedby="button-send" autoComplete="off" disabled></input>
									<button className="btn btn-text-style btn-light" type="submit" id="button-send" disabled>
										<Image
											src={"/assets/svg/Send-logo.svg"}
											width={21}
											height={22}
											alt="Send"
										/>
									</button>
								</div>
							</div>
						)
					}
				</div>
			</div>
		</div>
	)
}

export default Chat
