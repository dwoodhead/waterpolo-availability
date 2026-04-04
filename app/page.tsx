import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { sessions, isExpired } from '@/lib/sessions'
import type { Rsvp } from '@/lib/types'
import SessionCard from '@/components/session-card'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const activeSessions = sessions.filter((s) => !isExpired(s))
  const sessionIds = activeSessions.map((s) => s.id)

  const { data: rsvps } = await supabase
    .from('rsvps')
    .select('*')
    .in('session_id', sessionIds)

  const rsvpsBySession: Record<string, Rsvp[]> = {}
  for (const rsvp of rsvps ?? []) {
    if (!rsvpsBySession[rsvp.session_id]) rsvpsBySession[rsvp.session_id] = []
    rsvpsBySession[rsvp.session_id].push(rsvp as Rsvp)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-12">
      {/* Header */}
      <header className="flex flex-col items-center pt-8 pb-6 text-center">
        <Image
          src="/logo.png"
          alt="Team logo"
          width={140}
          height={140}
          className="mb-1 mix-blend-multiply w-72 h-auto"
          priority
        />
        <h1 className="text-2xl font-black tracking-tight text-[#111111]">
          Training Availability
        </h1>
        <p className="mt-1 text-sm text-[#777777]">Sign up for upcoming practices below.</p>
      </header>

      <div className="flex flex-col gap-5">
        {activeSessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            rsvps={rsvpsBySession[session.id] ?? []}
          />
        ))}
      </div>
    </div>
  )
}
