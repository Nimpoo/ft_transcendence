"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { getAccessToken } from "../callback/api"
import "@/styles/Chat.css"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import React from 'react'
import ChatMessage from "@/components/ChatMessage"
import { MessageProps } from "@/components/ChatMessage"
import { useCookies } from "react-cookie"
import Link from "next/link"

import { useSession } from "@/providers/Session"
import { useSocket } from "@/providers/Socket"

interface Conversation {
    username: string;
    time: string;
    id: number;
    lastMessage: string;
}

function Chat(): React.JSX.Element {

    // document.querySelector('button-send').onclick = function (e) {
    //     const messageInput = document.querySelector('#input');
    //     const msg = messageInput.value;
    //     ws.send(JSON.stringify({
    //         'message': msg,
    //     }));
    // };

    const [cookies, setCookie] = useCookies(["session"]);
    const [conv, setConv] = useState(true);
    const [dropDown, setDropDown] = useState(false);
    const [newMessage, setNewMessage] = useState<string>("");
    const [messages, setMessages] = useState<string[]>([]);
    const [userNames, setUserNames] = useState([]);
    const [search, setSearch] = useState<string>("");
    const [results, setResults] = useState<User[]|null>(null);
    const searchTimeout = useRef<NodeJS.Timeout|null>(null);
    const [currentConv, setCurrentConv] = useState<string>("")
    const { session } = useSession()
    const [msgs, setMsgs] = useState<MessageProps[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);

  // const strSession = cookies.session; 
    const socket = useSocket()
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, [msgs]);

    useEffect(() => {
        if (socket) {
          socket.onmessage = (event) => {
            const messageData = JSON.parse(event.data);
            if (messageData.query_type === 'msg')
            {
                const newMsg = { message: messageData.content, isMyMessage: messageData.sender === session?.display_name };
                setMsgs(prevMsgs => [...prevMsgs, newMsg]);
                updateLastMessage(messageData.sender, messageData.content);
                // conversations.sort((a, b) => b.id - a.id);
                // setConversations(conversations);
            }
            console.log(event)
          };
          return () => {
            socket.onmessage = null;
          };
        }
      }, [socket]);

    async function chatUserNames() {
        try {
            const response = await fetch("api/users");
            if (response.ok) {
                const   data = await response.json();
                const   names = data.map((user: { name: string }) => user.name);
                if (names !== "")
                    setUserNames(names);
                console.log(userNames);
            } else {
                console.error("Failed to fetch user names:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching user names:", error);
        }
    }

    function getUsernameInChat (chat: any) {
        const currentUser = session?.display_name;
        const otherUser = chat.sender === currentUser ? chat.room.split('_')[1] : chat.sender;
        return otherUser;
    }

    async function getAllConv (user: string) {
        try {
            const response = await fetch(`http://${window.location.hostname}:8000/users/search/?q=${encodeURIComponent(session?.display_name ?? "")}`,
            {
                method: "GET"
            })
            if (response.ok) {
                const data = await response.json()
                console.log(data)
                const AllConv = data.map((chat: any) => ({
                    username: getUsernameInChat(chat),
                    lastMessage: chat.content,
                    isMyMessage: chat.sender === session?.display_name,
                    id: chat.id
                  }));
                AllConv.sort((a: Conversation, b: Conversation) => b.id - a.id);
                setConversations(AllConv);
                console.log(data)
            }
            else {
                console.error("Fetched failed")
                console.log(response)
            }
        }
        catch (error) {
            console.error("Fetched failed catched")
            console.error(error)
        }
    }

    async function getChatByUser (user: string) {
        try {
            const response = await fetch(`api/chat/getconv?user=${user}&sender=${encodeURIComponent(session?.display_name ?? "")}`,
            {
                method: "GET"
            })
            if (response.ok) {
                const data = await response.json()
                console.log("My name conv fetched :")
                console.log(session?.display_name)
                console.log("Name of the target conv fetched :")
                console.log(user)
                console.log(data)
                const chatMessages = data.map((chat: any) => ({
                    message: chat.content,
                    isMyMessage: chat.sender === session?.display_name
                  }));
                  setMsgs(chatMessages)            }
            else {
                console.error("Fetched failed")
                console.log(response)
            }
        }
        catch (error) {
            console.error("Fetched failed catched")
            console.error(error)
        }
    }

    async function userSearch() {
        if (search) {
            console.log(search)
            const response = await fetch(`http://${window.location.hostname}:8000/users/search?q=${encodeURIComponent(search)}`)
            setResults(await response.json())
            searchTimeout.current = null
        } else {
            setResults(null)
        }
    }

    function handleClick() {
        setConv(!conv);
        setSearch("");
    }

    function handleDropDown() {
        setDropDown(!dropDown);
    }

    function handleMessageSend() {
        const trimMsg = newMessage.trim();
        if (trimMsg !== "")
        {
            const newMsg = { message: newMessage, isMyMessage: true };
            setMessages(prevMessages => [...prevMessages, newMessage]);
            setMsgs(prevMsgs => [...prevMsgs, newMsg]);
            socket?.send(JSON.stringify({
                "query_type": "msg",
                "subtype": "privmsg",
                "target": currentConv,
                "sender": session?.display_name,
                "content": newMessage,
            }))
            setNewMessage("");
            updateLastMessage(currentConv, newMessage);
            // conversations.sort((a, b) => b.id - a.id);
            // setConversations(conversations);
        }
    }

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleMessageSend();
        }
    }

    function updateLastMessage(username: string, newLastMsg: string)
    {
        setConversations(prevConversations => {
            return prevConversations.map(conversation => {
                if (conversation.username === username)
                    return { ...conversation, lastMessage: newLastMsg}
                return conversation;
            });
        });
    }

    useEffect(() => {
        if (session?.display_name) {
        getAllConv(session.display_name);
        }
    }, [session?.display_name]);


    // useEffect(() => {
    //     chatUserNames();
    // }, []);

    useEffect(() => {
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current)
            searchTimeout.current = setTimeout(userSearch, 500)
        } else {
            searchTimeout.current = setTimeout(userSearch, 500)
        }
    }, [search])

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
                    {conversations.map((convo, index) => (
                        <div key={index}>
                            <input type="checkbox" className="btn-check" name="conv-1" id="btnconv" autoComplete="on"></input>
                            <label className="btn btn-outline-dark btn-1-conv" htmlFor="btnconv" onClick={() => {handleClick(); setCurrentConv(convo.username); getChatByUser(convo.username)}}>
                                <Image className="picture mt-1"
                                    src="/assets/svg/John Doe.svg"
                                    width={60}
                                    height={60}
                                    alt="prout"
                                />
                                <div>
                                    <div className="text-place">{convo.username}</div>
                                    <div className="text-truncate change-trunc">
                                        {convo.lastMessage}
                                    </div>
                                </div>
                            </label>
                        </div>
                    ))}
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
                                <input className="form-control input-style rounded-bottom-0 rounded-start-0" type="text" placeholder="Enter name(s) to start to chat..." aria-label="start chat" onChange={(e) => setSearch(e.target.value)}/>
                                {results && 
                                    <div>
                                        {results.map((user, key) => (
                                            <div key={key}>
                                                <Link onClick={() => {handleClick(); setCurrentConv(user.display_name); getChatByUser(user.display_name)}} href={""}>
                                                    {user.display_name}
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                }
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
                                <h5 className="conv-name">{currentConv}</h5>
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
                    <div className="conv-box" ref={chatContainerRef}>
                        {/* {getChatByUser()} */}
                        {msgs.map((msg, index) => (
                            <ChatMessage key={index} message={msg.message} isMyMessage={msg.isMyMessage} />
                        ))}
                    </div>
                    <div className="input-group">
                        <input className="form-control text-box-style" type="text" id="input" placeholder="New message" aria-label="enter message with one button add-on" aria-describedby="button-send" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleKeyPress}></input>
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