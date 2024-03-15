/** @type {import("next").NextConfig} */

const nextConfig = {
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
				destination: "http://localhost:8000/:path*/"
			}
		]
	}
}

export default nextConfig
