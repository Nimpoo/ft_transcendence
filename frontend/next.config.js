/** @type {import('next').NextConfig} */
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
	async rewrites() {
		return [
			{
				source: "/api/:path*",
				destination: "http://localhost:8000/:path*/"
			}
		]
	}
}

module.exports = nextConfig
