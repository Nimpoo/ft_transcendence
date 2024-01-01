import NextAuth from "next-auth/next";
import FortyTwo from "next-auth/providers/42-school";
import Discord from "next-auth/providers/discord";
import Github from "next-auth/providers/github";
import jwt from "jsonwebtoken";
import { OAuthConfig } from "next-auth/providers/oauth";

const handler = NextAuth({
	providers: [
		process.env.AUTH_FORTYTWO_ID && process.env.AUTH_FORTYTWO_SECRET ? FortyTwo({
			clientId: process.env.AUTH_FORTYTWO_ID,
			clientSecret: process.env.AUTH_FORTYTWO_SECRET
		}) : undefined,
		
		process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET ? Github({
			clientId: process.env.AUTH_GITHUB_ID,
			clientSecret: process.env.AUTH_GITHUB_SECRET
		}) : undefined,
		
		process.env.AUTH_DISCORD_ID && process.env.AUTH_DISCORD_SECRET ? Discord({
			clientId: process.env.AUTH_DISCORD_ID,
			clientSecret: process.env.AUTH_DISCORD_SECRET
		}) : undefined,
	].filter((provider): provider is OAuthConfig<any> => provider !== undefined),

	callbacks: {
		async signIn({ user, account }) {
			const jwt_secret = process.env["JWT_SECRET"]
			if (account && jwt_secret) {
				const response = await fetch("http://pong:8000/users/connect", { method: "POST", body: jwt.sign(account, jwt_secret) })
				if (response.status !== 200)
					return false

				const data = await response.json()
				user.name = data.nickname
				return true
			}
			return false
		},
	},
})

export { handler as GET, handler as POST }
