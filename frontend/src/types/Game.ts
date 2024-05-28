
interface Game {
	id: number
	room_uuid: string
	player_1: User
	player_2: User
	score1: number
	score2: number
	created_at: string
}
