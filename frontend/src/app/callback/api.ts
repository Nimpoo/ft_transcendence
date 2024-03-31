"use server"

async function getAccessToken(code: string): Promise<string> {
	if (!process.env["NEXT_PUBLIC_CLIENT_ID"] || !process.env["CLIENT_SECRET"] || !process.env["NEXT_PUBLIC_REDIRECT_URI"]) {
		throw new Error("One or more required variables are missing")
	}

	const response = await fetch(
		"https://api.intra.42.fr/oauth/token",
		{
			method: "POST",
			body: new URLSearchParams({
				grant_type: "authorization_code",
				client_id: process.env["NEXT_PUBLIC_CLIENT_ID"],
				client_secret: process.env["CLIENT_SECRET"],
				redirect_uri: process.env["NEXT_PUBLIC_REDIRECT_URI"],
				code
			})
		}
	)

	if (response.status != 200) {
		throw new Error(`api.intra.42.fr returned ${response.status}`)
	}

	const data = await response.json()
	const token = data["access_token"]

	if (token === undefined) {
		throw new Error("api.intra.42.fr didn't returned a access token")
	}

	return new Promise<string>(resolve => resolve(token))
}

export { getAccessToken }
