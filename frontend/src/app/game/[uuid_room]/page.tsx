"use client"

import { Ubuntu } from "next/font/google"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

import { useSession } from "@/providers/Session"
import { useGame } from "@/providers/Game"
import { useModal } from "@/providers/Modal"

import toast from "react-hot-toast"
import Canvas from "@/components/Canvas"

import "@/styles/Rainbow.css"
import Image from "next/image"

const ubu = Ubuntu ({
	subsets: ["latin"],
	weight: "700",
	preload: false
})

function GamingRoom(): React.JSX.Element | null {

	const [begin, setBegin] = useState<boolean>(true)

	const up = useRef<boolean>(false)
	const down = useRef<boolean>(false)
	const gameloop = useRef<NodeJS.Timeout>()

	const { session, status } = useSession()
	const { players, sendMessage, gameStatus } = useGame()
	const { createModal } = useModal()

	const router = useRouter()

	const man = 
	<div style={{display: "flex", flexDirection: "column", textAlign: "center"}}>
		<h1>Goal</h1>

		<br />

		<h3><u>PROTECT</u> your camp while trying to <u>SCORE</u> points on the opposing camp, all that by using your <u>PADDLE</u>.</h3>
		<h3>
			If one of the players scores&nbsp;

			<span
				style={{
					backgroundColor: "rgb(97, 45, 175)",
					border: "solid",
					borderColor: "rgb(7, 5, 75)",
				}}
			>
				10 POINTS
			</span>

			, he will emerge victorious and end the game.
		</h3>
		<h3>Careful, the ball get <u>FASTER</u> each collision with a paddle.</h3>

		<br />
		<br />

		<h1>Control</h1>

		<br />

		<div style={{display: "flex", justifyContent: "center", flexDirection: "row"}}>
			<h3
				style={{
					backgroundColor: "rgb(97, 45, 175)",
					border: "solid",
					borderColor: "rgb(7, 5, 75)",
				}}
			>
				&apos; W &apos;
			</h3>
			<h3>&emsp;&rarr; go <u>UP</u> the paddle</h3>
		</div>
		<div style={{display: "flex", justifyContent: "center", flexDirection: "row"}}>
			<h3
				style={{
					backgroundColor: "rgb(97, 45, 175)",
					border: "solid",
					borderColor: "rgb(7, 5, 75)",
				}}
			>
				&apos; S &apos;</h3>
			<h3>&emsp;&rarr; go <u>DOWN</u> the paddle</h3>
		</div>

		<br />
		<br />

		<h1>Trophies calculs</h1>

		<br />

		<h3
			style={{
				backgroundColor: "rgb(97, 45, 175)",
				border: "solid",
				borderColor: "rgb(7, 5, 75)",
			}}
		>
			| [YOUR SCORE] - [OPPONANT SCORE] * 3 |
		</h3>
		<p>This is the number of <u>TROPHIES</u> you lose or win.</p>
	</div>

	useEffect(() => {
		if (status == "disconnected") {
			toast.error("You are not connected")
			router.push("/")
		}
	}, [router, status])


	useEffect(() => {
		if (gameStatus === "in-game") {
			const keypresshandler = (e: any) => {
				if (e.key === "w" || e.key === "W") {
					up.current = true
				} else if (e.key === "s" || e.key === "S") {
					down.current = true
				}
			}

			const keyunpresshandler = (e: any) => {
				if (e.key === "w" || e.key === "W") {
					up.current = false
				} else if (e.key === "s" || e.key === "S") {
					down.current = false
				}
			}

			window.addEventListener("keydown", keypresshandler)
			window.addEventListener("keyup", keyunpresshandler)

			return () => {
				window.removeEventListener("keydown", keypresshandler)
				window.removeEventListener("keydown", keyunpresshandler)
			}
		}
	}, [gameStatus])

	useEffect(() => {
		if (gameStatus === "in-game") {
			gameloop.current = setInterval(() => {
				if (up.current && !down.current)
				{
					sendMessage({
						"type": "game.paddle",
						"user": session?.display_name,
						"id": session?.id.toString(),
						"key": "up",
						"player": `${players && players[0] === session?.display_name ? "1" : "2"}`,
					})
				}

				else if (!up.current && down.current)
				{
					sendMessage({
						"type": "game.paddle",
						"user": session?.display_name,
						"id": session?.id.toString(),
						"key": "down",
						"player": `${players && players[0] === session?.display_name ? "1" : "2"}`,
					})
				}
			}, 75)

			return () => clearInterval(gameloop.current)
		}
	}, [gameStatus, session, players])

	const LetsBegin = () => {
		setBegin(false)
		if (sendMessage) {
			sendMessage({
				"type": "game.begin",
				"user": session?.display_name,
				"id": session?.id.toString(),
			})
		}
	}

	useEffect(() => {
		if (!players.length) {
			router.push("/game")
			return
		}
	}, [players.length, router])

	return (
		<div style={{display: "flex", flexDirection: "column"}}>
			<div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
				<h5>{players && players.length > 0 ? players[0] : "Waiting for players ..."}</h5>
				<h5>{players && players.length > 1 ? players[1] : "Waiting for players ..."}</h5>
			</div>
			<Canvas />
			{begin && players[0] === session?.display_name && (
				<div>
					{players[1] ? (
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
						<h1
							style={{
								position: "absolute",
								top: "50%",
								left: "50%",
								transform: "translate(-50%, -50%)",
							}}
						>
							Waiting for an opponent ...
						</h1>
					)}
				</div>
			)}
			<div style={{display: "flex", justifyContent: "center"}}>
				<button
					onClick={() => { createModal(man) }}
					style={{
						background: "transparent",
						border: "none",
						padding: 0,
						cursor: "pointer",
						width: 72,
						height: 72,
					}}
				>
					<Image
						src={"/assets/svg/snes.svg"}
						width={72}
						height={72}
						alt="Manual"
					/>
				</button>
			</div>
		</div>
	)
}

export default GamingRoom
