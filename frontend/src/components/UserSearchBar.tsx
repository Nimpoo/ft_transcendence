import Link from "next/link"
import { useEffect, useRef, useState } from "react"

function UserSearchBar(): React.JSX.Element {
	const [search, setSearch] = useState<string>("")
	const [results, setResults] = useState<User[]|null>(null)
	const searchTimeout = useRef<NodeJS.Timeout|null>(null)

	useEffect(() => {
		const handleSearch = async () => {
			if (search) {
				const response = await fetch(`/api/users/search?q=${encodeURIComponent(search)}`)
				setResults(await response.json())
				searchTimeout.current = null
			} else {
				setResults(null)
			}
		}

		if (searchTimeout.current) {
			clearTimeout(searchTimeout.current)
			searchTimeout.current = setTimeout(handleSearch, 500)
		} else {
			searchTimeout.current = setTimeout(handleSearch, 500)
		}
	}, [search])

	return (
		<div>
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
