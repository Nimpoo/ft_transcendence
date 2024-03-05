"use server"

async function getAccessToken(code: string): Promise<string> {

	const response = await fetch(
		"https://api.intra.42.fr/oauth/token",
		{
			method: "POST",
			body: new URLSearchParams({
				"grant_type": "authorization_code",
				"client_id": process.env.NEXT_PUBLIC_CLIENT_ID as string,
				"client_secret": process.env.CLIENT_SECRET as string,
				"code": code,
				"redirect_uri": process.env.NEXT_PUBLIC_REDIRECT_URI as string,
			}),
		},
	)

	if (response.status != 200) {
		throw new Error(`api.intra.42.fr returned ${response.status}`)
	}

	const data = await response.json()
	const token = data["access_token"]

	return new Promise<string>(resolve => resolve(token))
}

export { getAccessToken }
