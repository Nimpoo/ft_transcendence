"use client"

import { useSession } from "next-auth/react"

import Image from "next/image"
import CountUp from "react-countup"

function Profile(): React.JSX.Element {

	const { data: session } = useSession()

	return (
		<main className="flex flex-row w-full h-[39rem] justify-between text-black">
			<div className="flex flex-col w-[310px] justify-between">

				<div className="h-[48%] rounded-3xl bg-[#D9D9D9] shadow-[5px_5px_0_1px_rgba(0,0,0,0.25)] p-4">
					<div className="flex flex-col items-center">
						<Image className="rounded-full"
							src={"https://thispersondoesnotexist.com"}
							width={200}
							height={200}
							alt="Your profile picture"
						/>
						<h1 className="text-3xl mt-3">{session?.user?.name}</h1>
					</div>
				</div>

				<div className="h-[48%] rounded-3xl bg-[#D9D9D9] shadow-[5px_5px_0_1px_rgba(0,0,0,0.25)] p-4">
					<div className="flex flex-col">
						<div className="flex items-center justify-center">
							<CountUp duration={5} className="px-2 truncate text-4xl" end={0} />
							<Image
								src={"/assets_ranking/trophy.png"}
								width={72}
								height={72}
								alt="Trophy"
							/>
						</div>
						<div className="flex items-center justify-center mt-1">
							<h3 className="text-2xl px-2">Challenger - I</h3>
							<Image
								src={"/assets_ranking/challenger_1.png"}
								width={45}
								height={45}
								alt="Challenger - I"
							/>
						</div>
					</div>

					<hr className="h-px w-full border-0 bg-gray-400 my-4" />

					<div className="flex justify-between text-lg">
						<div className="flex items-center">
							<span className="pr-2">Highest Trophies</span>
							<Image
								src={"/assets_ranking/trophy.png"}
								width={28}
								height={28}
								alt="Trophy"
							/>
						</div>
						<CountUp duration={5} className="truncate" end={0} />
					</div>

					<div className="flex justify-between text-lg">
						<span>Games played</span>
						<CountUp duration={5} className="truncate" end={0} />
					</div>

					<div className="flex justify-between text-lg text-green-500">
						<span>Victories</span>
						<CountUp duration={5} className="truncate" end={0} />
					</div>

					<div className="flex justify-between text-lg text-red-500">
						<span>Defeats</span>
						<CountUp duration={5} className="truncate" end={0} />
					</div>
				</div>

			</div>

			<div className="w-[620px] rounded-3xl bg-[#D9D9D9] shadow-[5px_5px_0_1px_rgba(0,0,0,0.25)] p-4">

			</div>

			<div className="w-[310px] rounded-3xl bg-[#D9D9D9] shadow-[5px_5px_0_1px_rgba(0,0,0,0.25)] p-4">

			</div>
		</main>
	)
}

export default Profile
