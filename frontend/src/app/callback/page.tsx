"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { getAccessToken } from "./api"
import { useEffect } from "react"
import { useCookies } from "react-cookie"
import toast from "react-hot-toast"

function Callback(): React.JSX.Element {
	const searchParams = useSearchParams()
	const router = useRouter()
	const [cookies, setCookie] = useCookies(["session"])

	useEffect(() => {
		const handleCallback = async (token: string, dfa: string|null = null) => {
			let response = await fetch(
					`https://${window.location.hostname}:8000/users/`,
					{
						method: "POST",
						body: JSON.stringify((typeof dfa === "string") ? {token, dfa} : {token})
					}
				)

			let data = await response.json()

			if (response.status != 200) {
				throw new Error(data["message"])
			}
			else {
				if (data["wait!"] === "yo I need dfa bro") {
					await handleCallback(token, String(prompt("Enter your 2FA secret: ")))
				}
				else {
					setCookie("session", data["access_token"], {sameSite: "strict", secure: true})
				}
			}
		}

		const code = searchParams.get("code")

		if (code) {
				getAccessToken(code)
				.then(handleCallback)
				.catch(e => toast.error("Something went wrong, try again."))
				.then(() => router.push("/"))
		}
		else {
			router.push("/")
		}
	}, [searchParams, router, setCookie])

	return (
		<main>
		</main>
	)
}

export default Callback
