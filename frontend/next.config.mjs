/** @type {import("next").NextConfig} */

export default {
	images: {
		remotePatterns: [
			{
				protocol:"https",
				hostname:"thispersondoesnotexist.com",
				pathname:"/"
			},
		],
	},
	rewrites: async () => {
		return [
			{
				source: "/api/:path*",
				destination: "http://pong:8000/:path*/"
			}
		]
	}
}
