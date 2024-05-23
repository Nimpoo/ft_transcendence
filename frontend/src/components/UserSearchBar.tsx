"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"

function UserSearchBar(props: any): React.JSX.Element {
	const [search, setSearch] = useState<string>("")
	const [results, setResults] = useState<User[]>()
	const searchTimeout = useRef<NodeJS.Timeout>()

	useEffect(() => {
		const handleSearch = async () => {
			if (search)
			{
				const response = await fetch(`https://${window.location.hostname}:8000/users/search/?q=${encodeURIComponent(search)}`)
				const data = await response.json()
				setResults(data)
				clearTimeout(searchTimeout.current)
			}

			else
			{
				setResults(undefined)
			}
		}

		if (searchTimeout.current)
		{
			clearTimeout(searchTimeout.current)
		}

		searchTimeout.current = setTimeout(handleSearch, 500)
	}, [search])

	return (
		<div style={{width: "100%"}}>
			<input type="text" onChange={e => setSearch(e.target.value)} />
			{results &&
				<ul>
					{results.map((user, key) => (
						<li key={key}>
							<Link href={`/users/${user.login}`}>
								{user.display_name}
							</Link>
						</li>
					))}
				</ul>
			}
		</div>
	)
}

export default UserSearchBar
