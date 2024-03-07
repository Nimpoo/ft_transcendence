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
		const code = searchParams.get("code")

		if (code) {
			toast.promise(
				getAccessToken(code),
				{
					loading: "fetching api.intra.42.fr",
					success: "api.intra.42.fr fetched",
					error: "Something went wrong, try again",
				}
			)
				.then(token => {
					toast.promise(
						fetch(
							"/api/users",
							{
								method: "POST",
								body: `{"token":"${token}"}`,
							},
						),
						{
							loading: "fetching /api/users",
							success: "/api/users fetched",
							error: "Something went wrong, try again",
						}
					)
						.then(response => {
							if (response.status == 406) { // todo dfa handling
								alert('dfa required.')
							}

							return response.json()
						})
						.then(data => {
							setCookie(
								'session',
								data["access_token"],
								{
									secure: true,
									maxAge: 60 * 60 * 24 * 7,
									path: "/"
								}
							)

							router.push("/")
						})
				})
				.catch(error => {
					router.push("/")
				})
		} else {
			toast.error('You have to provide a \'code\' parameter')
			router.push("/")
		}
	}, [searchParams, router, setCookie])

	return <></>
}

export default Callback
