'use client'

import { useState, useActionState, useEffect } from 'react'
import { upsertRsvp, type ActionResult } from '@/app/actions'

type Props = {
  sessionId: string
}

const initialState: ActionResult = {}

export default function RsvpForm({ sessionId }: Props) {
  const [status, setStatus] = useState<'in' | 'out'>('in')
  const [isGoalie, setIsGoalie] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [result, action, pending] = useActionState(upsertRsvp, initialState)

  // Flash success briefly then hide
  useEffect(() => {
    if (result?.updated !== undefined && !result?.error) {
      setShowSuccess(true)
      const t = setTimeout(() => setShowSuccess(false), 2000)
      return () => clearTimeout(t)
    }
  }, [result])

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="session_id" value={sessionId} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="is_goalie" value={String(isGoalie)} />

      {/* Row 1: Name + Note */}
      <div className="flex gap-2">
        <input
          type="text"
          name="player_name"
          placeholder="Your name"
          required
          className="min-w-0 flex-1 rounded-lg border border-[#e8e2e2] bg-white px-3 py-2 text-sm text-[#111111] placeholder-[#aaa] outline-none transition-colors focus:border-[#8B1A1A]"
        />
        <input
          type="text"
          name="comment"
          placeholder="Note (optional)"
          maxLength={120}
          className="min-w-0 flex-1 rounded-lg border border-[#e8e2e2] bg-white px-3 py-2 text-sm text-[#111111] placeholder-[#aaa] outline-none transition-colors focus:border-[#8B1A1A]"
        />
      </div>

      {/* Row 2: In/Out + Goalie + Save */}
      <div className="flex items-center gap-2">
        <div className="flex overflow-hidden rounded-lg border border-[#e8e2e2] shrink-0">
          <button
            type="button"
            onClick={() => setStatus('in')}
            className={`px-3 py-2 text-sm font-semibold transition-colors ${
              status === 'in'
                ? 'bg-[#8B1A1A] text-white'
                : 'bg-white text-[#777777] hover:text-[#111111]'
            }`}
          >
            In
          </button>
          <button
            type="button"
            onClick={() => setStatus('out')}
            className={`px-3 py-2 text-sm font-semibold transition-colors ${
              status === 'out'
                ? 'bg-[#8B1A1A] text-white'
                : 'bg-white text-[#777777] hover:text-[#111111]'
            }`}
          >
            Out
          </button>
        </div>

        <label className="flex cursor-pointer items-center gap-1.5 text-sm text-[#777777] select-none shrink-0">
          <input
            type="checkbox"
            checked={isGoalie}
            onChange={(e) => setIsGoalie(e.target.checked)}
            className="h-4 w-4 rounded accent-[#8B1A1A]"
          />
          Goalie
        </label>

        <button
          type="submit"
          disabled={pending}
          className="ml-auto shrink-0 rounded-lg bg-[#8B1A1A] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save RSVP'}
        </button>

        {showSuccess && (
          <span className="text-sm text-[#16a34a] shrink-0 transition-opacity">✓</span>
        )}
        {result?.error && (
          <span className="text-sm text-[#8B1A1A] shrink-0">{result.error}</span>
        )}
      </div>

      {/* Edit hint */}
      <p className="text-xs text-[#aaaaaa]">
        To edit your RSVP, re-enter your name and save.
      </p>
    </form>
  )
}
