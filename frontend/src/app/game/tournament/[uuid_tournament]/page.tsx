"use client"

import { Ubuntu } from "next/font/google"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

import { useSession } from "@/providers/Session"
import { useGame } from "@/providers/Game"

import toast from "react-hot-toast"

import "@/styles/Rainbow.css"
import "@/styles/global.css"
import "@/styles/Tournament.css"

const ubu = Ubuntu ({
	subsets: ["latin"],
	weight: "700",
	preload: false
})

function TournamentRoom(): React.JSX.Element | null {

	const { session, status } = useSession()
	const { participants, sendMessage } = useGame()
	
	const router = useRouter()
	const pathname = usePathname().split("/")
	const uuid = pathname[pathname.length - 1]

	useEffect(() => {
		if (status == "disconnected") {
			toast.error("You are not connected")
			router.push("/")
		}
	}, [router, status])

	useEffect(() => {
		if (!participants.length) {
			toast.error("Unauthorized access to this tournament.")
			router.push("/game")
			return
		}
	}, [participants.length, router])

	const LetsBegin = () => {
		if (sendMessage) {
			sendMessage({
				"type": "game.beginTournament",
				"tournament_uuid": uuid,
			})
		}
	}

	return (
		<>
			<div className="m-auto">
				<div style={{display: "flex", justifyContent: "center"}}>
					<span className={ `stroke tournament-title ${ubu.className}` }>TOURNAMENT</span>
				</div>
				{participants && (
					<div className="bracket">
						<div className="round-left">
							<div className="participant-top">
								{participants[0]
									? <h1 className="font-color fs-4">{participants[0]}</h1>
									: <p className="font-color fs-4">0 Waiting for a participant ...</p>
								} 
							</div>
							<div className="participant">
								{participants[1]
									? <h1 className="font-color fs-4">{participants[1]}</h1>
									: <p className="font-color fs-4">1 Waiting for a participant ...</p>
								}
							</div>
						</div>
						<div className="lines-bracket-left"></div>
						<div className="lines-bracket-middle"></div>
						<div className="lines-bracket-right"></div>
						<div className="round-right">
							<div className="participant-top">
								{participants[2]
									? <h1 className="font-color fs-4">{participants[2]}</h1>
									: <p className="font-color fs-4">2 Waiting for a participant ...</p>
								} 
							</div>
							<div className="participant">
								{participants[3]
									? <h1 className="font-color fs-4">{participants[3]}</h1>
									: <p className="font-color fs-4">3 Waiting for a participant ...</p>
								}
							</div>
						</div>
					</div>
				)}
			</div>
			<div>
				{participants && participants.length === 4 && participants[0] === session?.login ? (
					<button 
					onClick={LetsBegin}
					className={"big-button-xl " + ubu.className}
					style={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
					}}
				>
					<span className="stroke rainbow-text">LETS BEGIN !</span>
				</button>
			) : (
				<></>
			)}
			</div>
		</>
	)
}

export default TournamentRoom
