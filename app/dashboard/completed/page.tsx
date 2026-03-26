import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LEAGUE_SCHEDULE, PLAYERS, PLAYER_COLUMNS, PLAYER_RANK_COLUMNS, IPL_TEAMS, parseTeams } from '@/lib/matchData'
import Link from 'next/link'
import { ArrowLeft, Trophy, ChevronRight, User as UserIcon, Clock } from 'lucide-react'

export default async function CompletedMatchesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rows } = await supabase
    .from('match_results')
    .select('*')
    .order('match_number', { ascending: false })

  // Fetch adder usernames
  const adderIds = new Set<string>()
  for (const row of rows ?? []) {
    if (row.added_by) adderIds.add(row.added_by)
  }
  const adderMap: Record<string, string> = {}
  if (adderIds.size > 0) {
    const { data: profiles } = await supabase.from('profiles').select('id, username').in('id', Array.from(adderIds))
    for (const p of profiles ?? []) {
      if (p.username) adderMap[p.id] = p.username
    }
  }

  const completed = (rows ?? []).map(row => {
    const match = LEAGUE_SCHEDULE.find(m => m.match === row.match_number)
    const results = PLAYERS.map(p => ({
      player: p,
      pts: row[PLAYER_COLUMNS[p]] ?? 0,
      rank: row[PLAYER_RANK_COLUMNS[p]] ?? 0,
    })).sort((a, b) => a.rank - b.rank)

    return {
      matchNumber: row.match_number,
      match,
      results,
      addedBy: row.added_by ? adderMap[row.added_by] ?? null : null,
      createdAt: row.created_at ?? null,
    }
  })

  const RANK_COLORS = ['#f0b429','#c0c8d8','#cd7f32','#9ba3b2','#9ba3b2','#f97316','#f04040']
  function rankColor(rank: number) { return RANK_COLORS[rank - 1] ?? '#9ba3b2' }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8,9,14,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: 58, display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <Link href="/dashboard" className="btn btn-ghost btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: 'var(--text-2)' }}>
          <ArrowLeft size={15} /> Dashboard
        </Link>
        <div style={{ height: 20, width: 1, background: 'var(--border)' }} />
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)' }}>
          Completed Matches ({completed.length})
        </div>
      </nav>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '28px 20px 80px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>Completed Matches</h1>
        <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginBottom: 28 }}>
          All {completed.length} matches with results submitted
        </p>

        <div className="scroll-list" style={{ gap: 14 }}>
          {completed.map(({ matchNumber, match, results, addedBy, createdAt }) => {
            if (!match) return null
            const [t1, t2] = parseTeams(match.teams)
            const team1 = IPL_TEAMS[t1]
            const team2 = IPL_TEAMS[t2]
            const winner = results[0]

            return (
              <div key={matchNumber} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div className="badge badge-muted" style={{ marginBottom: 8 }}>Match {matchNumber}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        {team1 && (
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: team1.bg, color: team1.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>
                            {t1}
                          </div>
                        )}
                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>{t1}</span>
                        <span style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>vs</span>
                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>{t2}</span>
                        {team2 && (
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: team2.bg, color: team2.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>
                            {t2}
                          </div>
                        )}
                      </div>
                      <div style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>
                        {match.venue} · {new Date(match.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })} · {match.time}
                      </div>
                    </div>
                    <Link href={`/dashboard/match/${matchNumber}`} className="btn btn-ghost btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none', color: 'var(--text-2)' }}>
                      Details <ChevronRight size={13} />
                    </Link>
                  </div>

                  {/* Meta */}
                  <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                    {addedBy && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: 'var(--text-3)' }}>
                        <UserIcon size={11} /> {addedBy}
                      </div>
                    )}
                    {createdAt && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: 'var(--text-3)' }}>
                        <Clock size={11} /> {new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Results row */}
                <div style={{ padding: '14px 22px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {results.map(r => (
                    <div key={r.player} style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 6,
                      background: r.rank === 1 ? 'rgba(240,180,41,0.08)' : r.rank === 7 ? 'rgba(240,64,64,0.06)' : 'var(--bg-3)',
                      border: `1px solid ${r.rank === 1 ? 'rgba(240,180,41,0.2)' : r.rank === 7 ? 'rgba(240,64,64,0.15)' : 'var(--border)'}`,
                      fontSize: '0.78rem',
                    }}>
                      <span style={{ color: rankColor(r.rank), fontWeight: 700, minWidth: 18 }}>#{r.rank}</span>
                      <span style={{ color: 'var(--text-2)' }}>{r.player}</span>
                      <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>{r.pts}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {completed.length === 0 && (
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <Trophy size={40} color="var(--text-3)" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 6 }}>No completed matches yet</div>
            <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Results will appear here once matches are played</p>
          </div>
        )}
      </main>
    </div>
  )
}
