"use strict"
"use client"

import { signIn, signOut, useSession } from "next-auth/react"

function Home(): JSX.Element {
	const { data: session } = useSession()

	return (
		<main>
			nickname: {session?.user?.name}
			<button onClick={() => signIn()}>sign in</button>
			<button onClick={() => signOut()}>sign out</button>
		</main>
	)
}

export default Home
