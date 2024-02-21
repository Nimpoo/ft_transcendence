import type { Metadata } from "next";

import "@/styles/Background.css"

export const metadata: Metadata = {
	title: "ft_transcendence",
	description: "Our final project",
};

function RootLayout({
	children,
}: {
	children: React.ReactNode;
}): React.JSX.Element {
	return (
		<html lang="en">
			<head>
			</head>
			<body className={ "bg-[url('/bg.png')] bg-cover bg-fixed bg-center bg-no-repeat text-white "}>

				<div className="m-auto max-w-7xl">
					{children}
				</div>

				<div id="gradient-bg">
					<div id="gradient-container">
						<div id="g1" />
						<div id="g2" />
						<div id="g3" />
						<div id="g4" />
						<div id="g5" />
					</div>
				</div>

			</body>
		</html>
	)
}

export default RootLayout
