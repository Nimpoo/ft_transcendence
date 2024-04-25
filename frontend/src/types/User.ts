interface User {
	id: number
	login: string
	display_name: string
	avatar: string
	friends: User[]
	blocked: User[]
	created_at: Date
}
