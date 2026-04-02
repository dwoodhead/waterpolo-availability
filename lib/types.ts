export type Rsvp = {
  id: string
  session_id: string
  player_name: string
  status: 'in' | 'out'
  is_goalie: boolean
  comment: string | null
  updated_at: string
}
