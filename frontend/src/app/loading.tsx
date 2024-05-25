"use client"

import "@/styles/loading.css"

function Loading(): React.JSX.Element {
	return (
		<div className="d-flex justify-content-center align-items-center flex-grow-1">
			<div className="loader" />
		</div>
	)
}

export default Loading
