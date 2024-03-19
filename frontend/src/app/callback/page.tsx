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
		const handleCallback = async (code: string) => {
			const token = await toast.promise(
				getAccessToken(code),
				{
					loading: "Fetching api.intra.42.fr",
					success: "api.intra.42.fr fetched",
					error: "Unable to fetch api.intra.42.fr"
				}
			)

			if (!token) {
				throw new Error("No token provided")
			}

			let response = await toast.promise(
				fetch(
					"/api/users",
					{
						method: "POST",
						body: JSON.stringify({token})
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
				if (response.status != 406) {
					throw new Error(data["message"])
				}

				const dfa = prompt("Enter your 2FA secret: ");

				response = await toast.promise(
					fetch(
						"/api/users",
						{
							method: "POST",
							body: JSON.stringify({token, dfa})
						}
					),
					{
						loading: "Fetching /users",
						success: "/users fetched",
						error: "Unable to fetch /users"
					}
				)

				data = await response.json()

				if (response.status != 200) {
					if (response.status != 200) {
						throw new Error(data["message"])
					}
				}
			}

			setCookie("session", data["access_token"])
		}

		const code = searchParams.get("code")

		if (code) {
			handleCallback(code).catch(e => toast.error("Something went wrong, try again."))
		}

		router.push("/")
	}, [searchParams, router, setCookie])

	return (
		<main>
		</main>
	)
}

export default Callback
