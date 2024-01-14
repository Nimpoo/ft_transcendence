"use client"

import { signIn, signOut, useSession } from "next-auth/react"

function Home(): React.JSX.Element {
	const { data: session } = useSession()

	return (
		<main className="flex flex-col">
			{session ? (
				<div>
					<p>connected as {session.user?.name}</p>
				</div>
			) : <p>not connected</p>}
			<div id="button-group" className="">
				<button className="w-40 h-11 bg-purple-600 bg-opacity-20 m-2 rounded-lg hover:bg-opacity-40 cursor-pointer transition" onClick={() => signIn()}>sign in</button>
				<button className="w-40 h-11 bg-purple-600 bg-opacity-20 m-2 rounded-lg hover:bg-opacity-40 cursor-pointer transition" onClick={() => signOut()}>sign out</button>
			</div>
		</main>
	)
}

export default Home
