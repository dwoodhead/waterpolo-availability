export type Session = {
  id: string
  label: string
  date: string   // ISO date: "YYYY-MM-DD"
  time: string   // Display time: "6:30 PM"
  location: string
  goalieTarget: number
  fieldTarget: number
}

// Returns true if the session ended more than 3 hours ago
export function isExpired(session: Session): boolean {
  const [timePart, meridiem] = session.time.split(' ')
  let [hours, minutes] = timePart.split(':').map(Number)
  if (meridiem === 'PM' && hours !== 12) hours += 12
  if (meridiem === 'AM' && hours === 12) hours = 0
  const sessionStart = new Date(`${session.date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`)
  return Date.now() > sessionStart.getTime() + 3 * 60 * 60 * 1000
}

// Edit this array to add, remove, or change training sessions.
export const sessions: Session[] = [
  {
    id: 'team-swim-2026-04-03',
    label: 'Team Swim — Friday, Apr 3',
    date: '2026-04-03',
    time: '6:30 AM',
    location: 'City Clubhouse',
    goalieTarget: 0,
    fieldTarget: 1,
  },
  {
    id: 'reggae-polo-2026-04-04',
    label: 'Reggae Polo — Saturday, Apr 4',
    date: '2026-04-04',
    time: '9:00 AM',
    location: 'City Clubhouse',
    goalieTarget: 1,
    fieldTarget: 1,
  },
  {
    id: 'practice-2026-04-06',
    label: 'Practice — Monday, Apr 6',
    date: '2026-04-06',
    time: '6:30 PM',
    location: 'City Clubhouse',
    goalieTarget: 2,
    fieldTarget: 13,
  },
  {
    id: 'cal-scrimmage-2026-04-08',
    label: 'Cal Scrimmage — Wednesday, Apr 8',
    date: '2026-04-08',
    time: '6:30 PM',
    location: 'City Clubhouse',
    goalieTarget: 1,
    fieldTarget: 7,
  },
  {
    id: 'stanford-scrimmage-2026-04-09',
    label: 'Stanford Scrimmage TBD — Thursday, Apr 9',
    date: '2026-04-09',
    time: '6:00 PM',
    location: 'Avery Aquatic Center',
    goalieTarget: 1,
    fieldTarget: 7,
  },
  {
    id: 'team-swim-2026-04-10',
    label: 'Team Swim — Friday, Apr 10',
    date: '2026-04-10',
    time: '6:30 AM',
    location: 'City Clubhouse',
    goalieTarget: 0,
    fieldTarget: 1,
  },
  {
    id: 'practice-2026-04-13',
    label: 'Practice — Monday, Apr 13',
    date: '2026-04-13',
    time: '6:30 PM',
    location: 'City Clubhouse',
    goalieTarget: 2,
    fieldTarget: 13,
  },
  {
    id: 'stanford-scrimmage-2026-04-14',
    label: 'Stanford Scrimmage TBD — Tuesday, Apr 14',
    date: '2026-04-14',
    time: '6:00 PM',
    location: 'Avery Aquatic Center',
    goalieTarget: 1,
    fieldTarget: 7,
  },
  {
    id: 'practice-2026-04-15',
    label: 'Practice — Wednesday, Apr 15',
    date: '2026-04-15',
    time: '6:30 PM',
    location: 'City Clubhouse',
    goalieTarget: 2,
    fieldTarget: 13,
  },
  {
    id: 'practice-2026-04-20',
    label: 'Practice — Monday, Apr 20',
    date: '2026-04-20',
    time: '6:30 PM',
    location: 'City Clubhouse',
    goalieTarget: 2,
    fieldTarget: 13,
  },
  {
    id: 'practice-2026-04-22',
    label: 'Practice — Wednesday, Apr 22',
    date: '2026-04-22',
    time: '6:30 PM',
    location: 'City Clubhouse',
    goalieTarget: 2,
    fieldTarget: 13,
  },
  {
    id: 'team-swim-2026-04-24',
    label: 'Team Swim — Friday, Apr 24',
    date: '2026-04-24',
    time: '6:30 AM',
    location: 'City Clubhouse',
    goalieTarget: 0,
    fieldTarget: 1,
  },
  {
    id: 'reggae-polo-2026-04-25',
    label: 'Reggae Polo — Saturday, Apr 25',
    date: '2026-04-25',
    time: '9:00 AM',
    location: 'City Clubhouse',
    goalieTarget: 1,
    fieldTarget: 1,
  },
  {
    id: 'practice-2026-04-27',
    label: 'Practice — Monday, Apr 27',
    date: '2026-04-27',
    time: '6:30 PM',
    location: 'City Clubhouse',
    goalieTarget: 2,
    fieldTarget: 13,
  },
  {
    id: 'stanford-scrimmage-2026-04-28',
    label: 'Stanford Scrimmage TBD — Tuesday, Apr 28',
    date: '2026-04-28',
    time: '6:00 PM',
    location: 'Avery Aquatic Center',
    goalieTarget: 1,
    fieldTarget: 7,
  },
  {
    id: 'practice-2026-04-29',
    label: 'Practice — Wednesday, Apr 29',
    date: '2026-04-29',
    time: '6:30 PM',
    location: 'City Clubhouse',
    goalieTarget: 2,
    fieldTarget: 13,
  },
]
