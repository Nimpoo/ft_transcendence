"use client"

import { redirect, useSearchParams } from "next/navigation"
import { getAccessToken } from "./api"
import { useEffect } from "react"

function Callback(): React.JSX.Element {
	const searchParams = useSearchParams()

	useEffect(() => {
		const code = searchParams.get("code")

		if (code) {
			getAccessToken(code).then((token: string) => {
				fetch(
					"/api/users",
					{
						method: "POST",
						body: `{"token":"${token}"}`,
					},
				).then(response => response.json()).then(data => console.log(data)) // TODO: Set cookie AND redirect to homepage ("/")
			})
		}
	}, [])

	return <></>
}

export default Callback
