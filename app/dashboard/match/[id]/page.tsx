import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { LEAGUE_SCHEDULE, PLAYERS, PLAYER_COLUMNS, PLAYER_RANK_COLUMNS, type PlayerName } from '@/lib/matchData'
import MatchResultsPage from './MatchResultsPage'

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const matchNum = Number(id)
  if (isNaN(matchNum)) notFound()

  const match = LEAGUE_SCHEDULE.find(m => m.match === matchNum)
  if (!match) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch match result
  const { data: row } = await supabase
    .from('match_results')
    .select('*')
    .eq('match_number', matchNum)
    .single()

  if (!row) notFound()

  // Build player results
  const playerResults = PLAYERS.map(p => ({
    player: p as PlayerName,
    fantasyPoints: row[PLAYER_COLUMNS[p]] ?? 0,
    rank: row[PLAYER_RANK_COLUMNS[p]] ?? 0,
  })).sort((a, b) => a.rank - b.rank)

  // Get who added it (added_by user id)
  let addedBy: string | null = null
  if (row.added_by) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', row.added_by)
      .single()
    addedBy = profile?.username ?? null
  }

  return (
    <MatchResultsPage
      match={match}
      playerResults={playerResults}
      addedBy={addedBy}
      addedAt={row.created_at ?? null}
      currentUser={user}
    />
  )
}
