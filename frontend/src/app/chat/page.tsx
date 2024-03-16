"use client"

import "@/styles/Chat.css"
import Image from "next/image"

function Chat(): React.JSX.Element {

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
                                src={"/svg/Cross.svg"}
                                width={25} 
                                height={25}
                                alt="Cross"
                            />
                        </button>
                    </div>
                </div>
                <div className="vstack gap-3">
                    <div>
                        <input type="checkbox" className="btn-check" name="conv-1" id="1st-conv" autoComplete="on"></input>
                        <label className="btn btn-outline-dark btn-1-conv" htmlFor="1st-conv">
                            <Image className="picture mt-1"
                                src="./svg/John Doe.svg"
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
                <div className="row box-2-title rounded-bottom-0">
                    <ul style={{display: "flex"}} className="list-inline">
                        <li className="list-inline-item" style={{marginTop: "3px"}}>
                            <Image className="icon"
                                src={"/svg/Question-mark.svg"}
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
                            src={"/svg/Send-logo.svg"}
                            width={21}
                            height={22}
                            alt="Send"
                        />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Chat