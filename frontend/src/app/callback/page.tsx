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
			let response = await toast.promise(
				fetch(
					"/api/users",
					{
						method: "POST",
						body: JSON.stringify((typeof dfa === "string") ? {token, dfa} : {token})
					}
				),
				{
					loading: "Fetching /users",
					success: "/users fetched",
					error: "Unable to fetch /users"
				}
			)

			let data = await response.json()

			if (response.status != 200) {
				if ((typeof dfa === "string") && response.status != 401 || response.status != 406) {
					throw new Error(data["message"])
				}

				await handleCallback(token, String(prompt("Enter your 2FA secret: ")))
			}

			else {
				setCookie("session", data["access_token"], {sameSite: true})
			}
		}

		const code = searchParams.get("code")

		if (code) {
			toast.promise(
				getAccessToken(code),
				{
					loading: "Fetching api.intra.42.fr",
					success: "api.intra.42.fr fetched",
					error: "Unable to fetch api.intra.42.fr"
				}
			)
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
