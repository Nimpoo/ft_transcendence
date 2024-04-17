"use client"

import Image from "next/image"
import { useState } from "react"

import "@/styles/Chat.css"
import ChatMessage from "@/components/ChatMessage"

function Chat(): React.JSX.Element {

	const [conv, setConv] = useState(true);
	const [dropDown, setDropDown] = useState(false);
	const [newMessage, setNewMessage] = useState<string>("");
	const [messages, setMessages] = useState<string[]>([]);

	function handleClick() {
		setConv(!conv);
	}

	function handleDropDown() {
		setDropDown(!dropDown);
	}

	function handleMessageSend() {
		const trimMsg = newMessage.trim();
		if (trimMsg !== "")
		{
			setMessages(prevMessages => [...prevMessages, newMessage]);
			setNewMessage("");
		}
	}

	const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			handleMessageSend();
		}
	}

	return (
		<div className="row">
			<div className="col-4 box-1-wrap">
				<div className="row box-1-title">
					<div className="col-9 mt-3">
						<p className="fs-4">Conversations</p>
					</div>
					<div className="col-3 mt-3">
						<button type="button" className="btn">
							<Image className="image"
								src={"/assets/svg/Cross.svg"}
								width={25} 
								height={25}
								alt="Cross"
							/>
						</button>
					</div>
				</div>
				<div className="vstack gap-3 scrollab">
					<div>
						<input type="checkbox" className="btn-check" name="conv-1" id="1st-conv" autoComplete="on"></input>
						<label className="btn btn-outline-dark btn-1-conv" htmlFor="1st-conv" onClick={handleClick}>
							<Image className="picture mt-1"
								src="./assets/svg/John Doe.svg"
								width={60}
								height={60}
								alt="John Doe"
							/>
							<div>
								<div className="text-place">John Doe</div>
								<div className="text-truncate change-trunc">
									This text is quite long, and will be truncated once displayed.
								</div>
							</div>
						</label>
					</div>
				</div>
			</div>

			
			<div className="col-8 ms-3 box-2-wrap">
				{ conv && <div>
					<div className="row box-2-title rounded-bottom-0">
						<ul style={{display: "flex"}} className="list-inline">
							<li className="list-inline-item" style={{marginTop: "3px"}}>
								<Image className="icon"
									src={"/assets/svg/Question-mark.svg"}
									width={59}
									height={59}
									alt="question mark">
								</Image>
							</li>
							<li className="list-inline-item">
								<input className="form-control input-style rounded-bottom-0 rounded-start-0" type="text" placeholder="Enter name(s) to start to chat..." aria-label="start chat"/>
							</li>
						</ul>
					</div>
					<div className="conv-box">
					</div>
					<div className="input-group">
						<input className="form-control text-box-style" type="text" placeholder="New message" aria-label="enter message with one button add-on" aria-describedby="button-send" disabled></input>
						<button className="btn btn-text-style btn-light" type="button" id="button-send" disabled>
							<Image className="logo"
								src={"/assets/svg/Send-logo.svg"}
								width={21}
								height={22}
								alt="Send"
							/>
						</button>
					</div>
				</div>}
				{ !conv && <div>
					<div className="row box-2-title rounded-bottom-0">
						<ul style={{display: "flex"}} className="list-inline">
							<li className="list-inline-item" style={{marginTop: "3px"}}>
								<Image className="icon"
									src={"/assets/svg/John Doe.svg"}
									width={59}
									height={59}
									alt="John Doe">
								</Image>
							</li>
							<li className="list-inline-item">
								<h5 className="conv-name">John Doe</h5>
							</li>
							<li className="list-inline-item dropplace">
								<div className="dropdown">
									<button onClick={handleDropDown} className="dropbtn" data-bs-auto-close="true">
										<Image className="icon"
											src={"/assets/svg/Three-dots.svg"}
											width={25}
											height={10}
											alt="parameters">
										</Image>
									</button>
									{dropDown && (
										<ul className="dropdown-content list-group">
										   <li className="list-group-item"><a className="link-color" href="#">Link 1</a></li>
										   <li className="list-group-item"><a className="link-color" href="#">Link 2</a></li>
										   <li className="list-group-item"><a className="link-color" href="#">Link 3</a></li>
										</ul>
									)}
								</div>
							</li>
						</ul>
					</div>
					<div className="conv-box">
						<ChatMessage message="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." isMyMessage={false}></ChatMessage>
						<ChatMessage message="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." isMyMessage={true}></ChatMessage>
						{messages.map((message, index) => (
							<ChatMessage key={index} message={message} isMyMessage={true} />
						))}
					</div>
					<div className="input-group">
						<input className="form-control text-box-style" type="text" placeholder="New message" aria-label="enter message with one button add-on" aria-describedby="button-send" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleKeyPress}></input>
						<button className="btn btn-text-style btn-light" type="button" id="button-send" onClick={handleMessageSend}>
							<Image className="logo"
								src={"/assets/svg/Send-logo.svg"}
								width={21}
								height={22}
								alt="Send"
							/>
						</button>
					</div>
				</div>}
			</div>
		</div>
	)
}

export default Chat