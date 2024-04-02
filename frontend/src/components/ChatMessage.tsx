"use client"

import React from "react"
import "@/styles/ChatMessage.css"
import Image from "next/image"

interface MessageProps {
    message: string;
    isMyMessage?: boolean;
}

const MeChatMessage: React.FC<MessageProps> = ({message, isMyMessage}) => {
    return (
        <>
            {isMyMessage && <div className="my-entire-div clearfix">
                <div className="my-message-div">
                    {message}
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
                </div>
            </div>}
        </> 
    )
}

export default MeChatMessage
