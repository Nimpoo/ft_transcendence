function Loading(): JSX.Element {
	return (
		<div>
			<svg width="32" height="32" viewBox="0 0 16 16" fill="none" data-view-component="true" className="animate-spin font-bold">
				<circle cx="8" cy="8" r="7" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" vectorEffect="non-scaling-stroke" fill="none"></circle>
				<path d="M15 8a7.002 7.002 0 00-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke"></path>
			</svg>
		</div>
	)
}

export default Loading
