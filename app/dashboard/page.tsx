import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PLAYERS, PLAYER_COLUMNS, PLAYER_RANK_COLUMNS } from '@/lib/matchData'
import Dashboard from './Dashboard'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get profile username
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  // Fetch all results (include added_by and created_at)
  const { data: rows, error } = await supabase
    .from('match_results')
    .select('*')
    .order('match_number', { ascending: true })

  if (error) {
    console.error('Error fetching results:', error)
  }

  const resultsMap: Record<number, Record<string, number | string>> = {}
  for (const row of rows ?? []) {
    const d: Record<string, number | string> = {}
    for (const p of PLAYERS) {
      d[p + '_points'] = row[PLAYER_COLUMNS[p]] ?? 0
      d[p + '_rank']   = row[PLAYER_RANK_COLUMNS[p]] ?? 0
    }
    d['added_by'] = row.added_by ?? ''
    d['created_at'] = row.created_at ?? ''
    resultsMap[row.match_number] = d
  }

  return <Dashboard user={user} initialResults={resultsMap} username={profile?.username ?? null} />
}
