"use client"

import React from "react"
import "@/styles/ChatMessage.css"
import Image from "next/image"

export interface MessageProps {
    message: string;
    isMyMessage?: boolean;
    timestamp?: string;
}

const MeChatMessage: React.FC<MessageProps> = ({message, isMyMessage, timestamp}) => {
    return (
        <>
            {isMyMessage && <div className="my-entire-div clearfix">
                <div className="my-message-div">
                    {message}
                    <p className="my-timestamp">{timestamp}</p>
                </div>
                <div className="my-image-div">   
                    <Image className="avatar"
                        src={"./assets/svg/John Doe.svg"}
                        width={25}
                        height={25}
                        alt="John Doe">
                    </Image>
                </div>
            </div>}
            {!isMyMessage && <div className="friend-entire-div clearfix">
                <div className="friend-image-div">   
                    <Image className="avatar"
                        src={"./assets/svg/John Doe.svg"}
                        width={25}
                        height={25}
                        alt="John Doe">
                    </Image>
                </div>
                <div className="friend-message-div">
                    {message}
                    <p className="friend-timestamp">{timestamp}</p>
                </div>
            </div>}
        </> 
    )
}

export default MeChatMessage
