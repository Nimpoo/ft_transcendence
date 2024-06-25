"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"

import "@/styles/UserSearchBar.css"
import { useSession } from "@/providers/Session"

function UserSearchBar(props: any): React.JSX.Element {
	const {session} = useSession()
	const [search, setSearch] = useState<string>("")
	const [results, setResults] = useState<User[]>()
	const searchTimeout = useRef<NodeJS.Timeout>()

	useEffect(() => {
		if (search)
		{
			const handleSearch = async () => {
				if (0 > search.length || search.length > 30)
				{
					toast.error("Limit exceeded")
					return
				}
				const response = await session?.api(`/users/search/?q=${encodeURIComponent(search)}`)
				if (response?.ok)
				{
					const data = await response.json()
					setResults(data)
					clearTimeout(searchTimeout.current)
				}
			}

			if (searchTimeout.current)
				clearTimeout(searchTimeout.current)

			searchTimeout.current = setTimeout(handleSearch, 500)
		}
		else
		{
			setResults(undefined)
			if (searchTimeout.current)
				clearTimeout(searchTimeout.current)
		}
	}, [search, session])

	return (
		<div style={{width: "100%"}}>
			<input
				className="input-style-1"
				type="text"
				placeholder="Search usernames..."
				onChange={e => setSearch(e.target.value)}
				maxLength={30}
			/>
			{results &&
				<ul className="ul-class list-group">
					{results.map((user, key) => (
						<li className="li-class list-group-item" key={key}>
							<Link href={`/users/${user.login}`}>
								<a className="a-class">{user.display_name}</a>
							</Link>
						</li>
					))}
				</ul>
			}
		</div>
	)
}

export default UserSearchBar
