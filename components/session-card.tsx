import type { Session } from '@/lib/sessions'
import type { Rsvp } from '@/lib/types'
import RsvpForm from './rsvp-form'

type Props = {
  session: Session
  rsvps: Rsvp[]
}

function ProgressBar({ count, target, label }: { count: number; label: string; target: number }) {
  const pct = target > 0 ? Math.min((count / target) * 100, 100) : 0
  const met = count >= target
  return (
    <div className="mb-3">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-[#777777]">{label}</span>
        <span className={met ? 'font-bold text-[#16a34a]' : 'font-medium text-[#111111]'}>
          {count} / {target}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0eaea]">
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{
            width: `${pct}%`,
            backgroundColor: met ? '#16a34a' : '#8B1A1A',
          }}
        />
      </div>
    </div>
  )
}

export default function SessionCard({ session, rsvps }: Props) {
  const inRsvps = rsvps.filter((r) => r.status === 'in')
  const outRsvps = rsvps.filter((r) => r.status === 'out')
  const goaliesIn = inRsvps.filter((r) => r.is_goalie)
  const fieldIn = inRsvps.filter((r) => !r.is_goalie)

  return (
    <div className="rounded-xl border border-[#e8e2e2] bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold leading-snug text-[#111111]">{session.label}</h2>
          <p className="mt-0.5 text-sm text-[#777777]">
            {session.time} · {session.location}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[#f5eaea] px-3 py-1 text-xs font-semibold text-[#8B1A1A]">
          {inRsvps.length} in
        </span>
      </div>

      {/* Progress bars */}
      <ProgressBar count={goaliesIn.length} target={session.goalieTarget} label="Goalies" />
      <ProgressBar count={fieldIn.length} target={session.fieldTarget} label="Field Players" />

      {/* Attendee lists */}
      {inRsvps.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#777777]">
            Coming ({inRsvps.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {inRsvps.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-1.5 rounded-full border border-[#e8e2e2] bg-[#f7f5f5] px-3 py-1 text-sm"
              >
                <span className="text-[#111111]">{r.player_name}</span>
                {r.is_goalie && (
                  <span className="rounded bg-[#f5eaea] px-1.5 py-0.5 text-xs font-semibold text-[#8B1A1A]">
                    GK
                  </span>
                )}
                {r.comment && (
                  <span className="text-xs text-[#777777]">· {r.comment}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {outRsvps.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#777777]">
            Out ({outRsvps.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {outRsvps.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-1.5 rounded-full border border-[#e8e2e2] bg-[#f7f5f5] px-3 py-1 text-sm text-[#777777]"
              >
                <span>{r.player_name}</span>
                {r.comment && <span className="text-xs">· {r.comment}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RSVP form */}
      <div className="mt-5 border-t border-[#e8e2e2] pt-5">
        <RsvpForm sessionId={session.id} />
      </div>
    </div>
  )
}
