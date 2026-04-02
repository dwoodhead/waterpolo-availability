'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'

export type ActionResult = {
  error?: string
  updated?: boolean
}

export async function upsertRsvp(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session_id = formData.get('session_id') as string
  const player_name = (formData.get('player_name') as string).trim()
  const status = formData.get('status') as 'in' | 'out'
  const is_goalie = formData.get('is_goalie') === 'true'
  const comment = (formData.get('comment') as string).trim() || null

  if (!session_id || !player_name || !status) {
    return { error: 'Missing required fields.' }
  }

  // Check if an existing RSVP exists for this player+session
  const { data: existing } = await supabase
    .from('rsvps')
    .select('id')
    .eq('session_id', session_id)
    .eq('player_name', player_name)
    .maybeSingle()

  const { error } = await supabase.from('rsvps').upsert(
    {
      session_id,
      player_name,
      status,
      is_goalie,
      comment,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'session_id,player_name' }
  )

  if (error) {
    return { error: 'Failed to save. Please try again.' }
  }

  revalidatePath('/')
  return { updated: !!existing }
}
