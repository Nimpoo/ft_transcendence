"use client"

import { useSession } from "@/providers/Session"

function GamingRoom(): React.JSX.Element {

	const { session } = useSession()	

	return(
		<>
			{session?.nickname}
		</>
	)
}

export default GamingRoom
