"use client"

import { redirect, useSearchParams } from "next/navigation"
import { getAccessToken } from "./api"
import { useEffect } from "react"
import { useCookies } from "react-cookie"

function Callback(): React.JSX.Element {
	const searchParams = useSearchParams()

	const [cookies, setCookie] = useCookies(["session"])

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
				)
				.then(response => response.json())
				.then(data => {
					setCookie("session", data["access_token"], {
						// httpOnly: true,
						secure: true,
						maxAge: 60 * 60 * 24 * 7,
						path: "/",
					})
					console.log(data)
					console.log(cookies.session)
				}) // TODO: Set cookie AND redirect to homepage ("/")
			})
		}
	}, [cookies.session, setCookie, searchParams])

	return <></>
}

export default Callback
