'use client'

import { useState, useRef, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import {
  BarChart2, Trophy, Calendar, MessageSquare, X, ChevronRight, Send,
  CheckCircle, Plus, LogOut, User as UserIcon, Skull, Crown, Lock, Eye,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Area, AreaChart, CartesianGrid, Cell,
} from 'recharts'
import {
  LEAGUE_SCHEDULE, PLAYERS, RANK_POINTS, PLAYER_COLUMNS, PLAYER_RANK_COLUMNS,
  TOURNAMENT_NAME, ROYAL_MESSAGES, HUMILIATION_MESSAGES, SECOND_LAST_MESSAGES,
  IPL_TEAMS, parseTeams,
  type PlayerName, type Match,
} from '@/lib/matchData'
import { createClient } from '@/lib/supabase/client'
import { logout } from '@/app/login/actions'
import Link from 'next/link'

type ResultsMap = Record<number, Record<string, number | string>>

interface Props {
  user: User
  initialResults: ResultsMap
  username: string | null
}

/* ── Team Logo Component ──────────────────────────────────── */
function TeamLogo({ code, size = 28 }: { code: string; size?: number }) {
  const team = IPL_TEAMS[code]
  if (!team) return <span style={{ fontSize: size * 0.45, fontWeight: 800, color: 'var(--text-3)' }}>{code}</span>
  return (
    <img
      src={team.logo}
      alt={team.short}
      width={size}
      height={size}
      style={{ borderRadius: '50%', objectFit: 'contain', background: team.bg }}
      onError={(e) => {
        // Fallback to text if image fails
        const el = e.currentTarget
        el.style.display = 'none'
        const span = document.createElement('span')
        span.textContent = team.short
        span.style.cssText = `font-size:${size * 0.35}px;font-weight:800;color:${team.color};`
        el.parentElement?.appendChild(span)
      }}
    />
  )
}

/* ── Match Teams Display ─────────────────────────────────── */
function MatchTeams({ teams, size = 28 }: { teams: string; size?: number }) {
  const [t1, t2] = parseTeams(teams)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <TeamLogo code={t1} size={size} />
      <span style={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>{t1}</span>
      <span style={{ color: 'var(--text-3)', fontSize: '0.75rem', fontWeight: 500 }}>vs</span>
      <span style={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>{t2}</span>
      <TeamLogo code={t2} size={size} />
    </div>
  )
}

/* ── Leaderboard ─────────────────────────────────────────── */
interface LBEntry {
  player: PlayerName; leaguePoints: number; totalFantasy: number;
  matchesPlayed: number; rank: number;
}

function computeLeaderboard(results: ResultsMap): LBEntry[] {
  const stats: Record<PlayerName, { lp: number; tf: number; mp: number }> = {} as never
  for (const p of PLAYERS) stats[p] = { lp: 0, tf: 0, mp: 0 }

  for (const m of Object.values(results)) {
    for (const p of PLAYERS) {
      const rank = Number(m[p + '_rank'] ?? 0)
      const pts = Number(m[p + '_points'] ?? 0)
      if (rank >= 1 && rank <= 7) {
        stats[p].lp += RANK_POINTS[rank - 1]
        stats[p].tf += pts
        stats[p].mp++
      }
    }
  }

  const entries = PLAYERS.map(p => ({
    player: p, leaguePoints: stats[p].lp, totalFantasy: stats[p].tf,
    matchesPlayed: stats[p].mp, rank: 0,
  }))
  entries.sort((a, b) => b.leaguePoints !== a.leaguePoints
    ? b.leaguePoints - a.leaguePoints : b.totalFantasy - a.totalFantasy)
  entries.forEach((e, i) => { e.rank = i + 1 })
  return entries
}

function getMatchContext(results: ResultsMap) {
  const all = Object.keys(results).map(Number).sort((a, b) => a - b)
  if (!all.length) return 'No results yet.'
  return all.map(n => {
    const m = LEAGUE_SCHEDULE.find(x => x.match === n)
    const data = results[n]
    const line = PLAYERS.map(p => `${p}: ${data[p + '_points'] ?? 0}pts(#${data[p + '_rank'] ?? 0})`).join(', ')
    return `Match ${n} (${m?.teams ?? '?'}, ${m?.date ?? '?'}): ${line}`
  }).join('\n')
}

function getUpcomingContext(today: string) {
  const upcoming = LEAGUE_SCHEDULE.filter(m => m.date >= today).slice(0, 15)
  if (!upcoming.length) return 'No upcoming matches.'
  return upcoming.map(m => `Match ${m.match}: ${m.teams} — ${m.date} ${m.time} at ${m.venue}`).join('\n')
}

function getLBContext(entries: LBEntry[]) {
  return entries.map(e => `#${e.rank} ${e.player}: ${e.leaguePoints}lp, ${e.totalFantasy.toFixed(1)}fp, ${e.matchesPlayed}matches`).join('\n')
}

/* ── IST date ────────────────────────────────────────────── */
function todayIST() {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/* ── Rank colors ─────────────────────────────────────────── */
const RANK_COLORS = ['#f0b429', '#c0c8d8', '#cd7f32', '#9ba3b2', '#9ba3b2', '#f97316', '#f04040']
function rankColor(rank: number) { return RANK_COLORS[rank - 1] ?? '#9ba3b2' }

/* ── Add Result Modal ───────────────────────────────────── */
function AddResultModal({ match, onClose, onSaved, userId }: {
  match: Match; onClose: () => void; onSaved: (r: ResultsMap) => void; userId: string
}) {
  const [rows, setRows] = useState(Array(7).fill(null).map(() => ({ player: '' as PlayerName | '', pts: '' })))
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const selected = rows.map(r => r.player).filter(Boolean)
  const available = (i: number) => PLAYERS.filter(p => p === rows[i].player || !selected.includes(p))

  function update(i: number, field: 'player' | 'pts', v: string) {
    setRows(prev => { const n = [...prev]; n[i] = { ...n[i], [field]: v }; return n })
  }

  async function save() {
    const filled = rows.filter(r => r.player && r.pts !== '')
    if (filled.length !== 7) { setErr('Fill all 7 players'); return }

    const sorted = [...filled].sort((a, b) => Number(b.pts) - Number(a.pts))
    const rankMap: Record<string, number> = {}
    sorted.forEach((r, i) => { rankMap[r.player] = i + 1 })

    const record: Record<string, number | string> = {
      match_number: match.match,
      added_by: userId,
      created_at: new Date().toISOString(),
    }
    for (const r of filled) {
      const p = r.player as PlayerName
      record[PLAYER_COLUMNS[p]] = Number(r.pts)
      record[PLAYER_RANK_COLUMNS[p]] = rankMap[r.player]
    }

    setSaving(true); setErr('')
    const sb = createClient()
    const { error } = await sb.from('match_results').upsert(record, { onConflict: 'match_number' })
    if (error) { setErr(error.message); setSaving(false); return }

    const { data } = await sb.from('match_results').select('*').order('match_number')
    const newMap: ResultsMap = {}
    for (const row of data ?? []) {
      const d: Record<string, number | string> = {}
      for (const p of PLAYERS) {
        d[p + '_points'] = row[PLAYER_COLUMNS[p]] ?? 0
        d[p + '_rank'] = row[PLAYER_RANK_COLUMNS[p]] ?? 0
      }
      d['added_by'] = row.added_by ?? ''
      d['created_at'] = row.created_at ?? ''
      newMap[row.match_number] = d
    }
    onSaved(newMap); onClose()
  }

  const [t1, t2] = parseTeams(match.teams)

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="badge badge-blue" style={{ marginBottom: 8 }}>Match {match.match}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <TeamLogo code={t1} size={32} /> <span style={{ fontWeight: 800, fontSize: '1.15rem' }}>{t1}</span>
                <span style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>vs</span>
                <span style={{ fontWeight: 800, fontSize: '1.15rem' }}>{t2}</span> <TeamLogo code={t2} size={32} />
              </div>
              <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', marginTop: 3 }}>
                {match.venue} · {new Date(match.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })} · {match.time}
              </p>
            </div>
            <button className="btn btn-ghost" onClick={onClose} style={{ padding: 8, borderRadius: 8 }}><X size={16} /></button>
          </div>
        </div>

        <div style={{ padding: '20px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Player</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fantasy Pts</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rows.map((row, i) => (
              <div key={i} className="add-result-row">
                <select className="input" value={row.player} onChange={e => update(i, 'player', e.target.value)}>
                  <option value="">Select player…</option>
                  {available(i).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <input type="number" className="input" placeholder="0" value={row.pts} onChange={e => update(i, 'pts', e.target.value)} step="0.1" />
              </div>
            ))}
          </div>
          {err && (
            <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(240,64,64,0.08)', border: '1px solid rgba(240,64,64,0.2)', color: 'var(--red)', fontSize: '0.85rem' }}>
              {err}
            </div>
          )}
        </div>

        <div style={{ padding: '16px 28px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save Result'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── AI Chat ─────────────────────────────────────────────── */
interface ChatMsg { role: 'user' | 'ai'; content: string }

function ChatPanel({ onClose, lbContext, matchContext, username, upcomingContext }: {
  onClose: () => void; lbContext: string; matchContext: string; username: string; upcomingContext: string;
}) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([{
    role: 'ai', content: `Hey ${username}! I've got all the leaderboard data loaded. Ask me about your standings, strategy tips, or I can roast your friends.`
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  async function send() {
    const msg = input.trim(); if (!msg || loading) return
    setMsgs(p => [...p, { role: 'user', content: msg }]); setInput(''); setLoading(true)
    const currentMsgs = [...msgs, { role: 'user' as const, content: msg }]
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          playerName: username,
          leaderboardContext: lbContext,
          matchResultsContext: matchContext,
          upcomingContext,
          history: currentMsgs.slice(1), // skip the initial greeting
        }),
      })
      const d = await res.json()
      setMsgs(p => [...p, { role: 'ai', content: d.error ? `Error: ${d.error}` : d.message }])
    } catch { setMsgs(p => [...p, { role: 'ai', content: 'Failed to reach AI. Check connection.' }]) }
    finally { setLoading(false) }
  }

  return (
    <div className="chat-panel">
      <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={16} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Fantasy AI</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>Talking to {username}</div>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: 7, borderRadius: 8 }}><X size={15} /></button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-start' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {m.role === 'user' ? <UserIcon size={12} color="white" /> : <MessageSquare size={12} color="var(--text-2)" />}
            </div>
            <div style={{
              maxWidth: '78%', padding: '10px 14px', fontSize: '0.85rem', lineHeight: 1.6,
              borderRadius: m.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
              background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-2)',
              color: m.role === 'user' ? 'white' : 'var(--text-1)',
              border: m.role === 'ai' ? '1px solid var(--border)' : 'none',
            }}>
              {m.role === 'ai' ? (
                <div className="chat-markdown">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageSquare size={12} color="var(--text-2)" /></div>
            <div style={{ padding: '10px 14px', borderRadius: '4px 14px 14px 14px', background: 'var(--bg-2)', border: '1px solid var(--border)', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 1, 2].map(d => <div key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-3)', animation: `pulse-red ${0.6 + d * 0.15}s ease-in-out infinite alternate` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" placeholder="Ask anything about the league…" value={input}
            onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()} style={{ padding: '10px 14px' }}>
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Match Card Component ────────────────────────────────── */
function MatchCard({ match, isToday, isFuture, isDone, mResult, onAddResult, addedByName }: {
  match: Match; isToday: boolean; isFuture: boolean; isDone: boolean;
  mResult: Record<string, number | string> | undefined;
  onAddResult: () => void; addedByName: string | null;
}) {
  const canAdd = !isFuture && !isDone
  const [showAdder, setShowAdder] = useState(false)

  return (
    <div className={isToday ? 'match-today card-flat' : 'card-flat'}
      style={{ padding: '16px 20px', borderRadius: 12, opacity: isFuture ? 0.4 : 1, position: 'relative' }}>
      <div className="match-card-content">
        {/* Match num */}
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: isToday ? 'var(--accent)' : 'var(--bg-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.72rem', fontWeight: 800, color: isToday ? 'white' : 'var(--text-3)'
        }}>
          M{match.match}
        </div>

        {/* Team logos + names */}
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            {isToday && <span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>TODAY</span>}
            <MatchTeams teams={match.teams} size={24} />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
            {match.venue} · {match.time}
          </div>
        </div>

        {/* Date */}
        <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', minWidth: 60, textAlign: 'right' }}>
          {new Date(match.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })}
        </div>

        {/* Action buttons */}
        {isFuture ? (
          <div className="badge badge-muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Lock size={10} /> Upcoming
          </div>
        ) : isDone ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAdder(!showAdder)}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Eye size={13} color="var(--green)" /> Show Result
            </button>
            <Link href={`/dashboard/match/${match.match}`} className="btn btn-ghost btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
              <ChevronRight size={13} />
            </Link>
          </div>
        ) : (
          <button className={`btn btn-sm ${isToday ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={onAddResult}>
            <Plus size={13} /> Add Result
          </button>
        )}
      </div>

      {/* Show Result expanded */}
      {isDone && showAdder && mResult && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          {/* Added by info */}
          {addedByName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: '0.75rem', color: 'var(--text-3)' }}>
              <UserIcon size={12} />
              Added by <strong style={{ color: 'var(--text-1)' }}>{addedByName}</strong>
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {PLAYERS.map(p => {
              const rank = Number(mResult[p + '_rank'] ?? 0)
              const pts = Number(mResult[p + '_points'] ?? 0)
              return (
                <div key={p} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '3px 10px', borderRadius: 6,
                  background: 'var(--bg-3)', border: '1px solid var(--border)', fontSize: '0.75rem'
                }}>
                  <span style={{ color: rankColor(rank), fontWeight: 700 }}>#{rank}</span>
                  <span style={{ color: 'var(--text-2)' }}>{p.slice(0, 6)}</span>
                  <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>{pts}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Main Dashboard ─────────────────────────────────────── */
export default function Dashboard({ user, initialResults, username }: Props) {
  const [tab, setTab] = useState<'matches' | 'leaderboard'>('matches')
  const [results, setResults] = useState<ResultsMap>(initialResults)
  const [addMatch, setAddMatch] = useState<Match | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [addedByNames, setAddedByNames] = useState<Record<string, string>>({})

  const displayName = username || user.email?.split('@')[0] || 'Player'
  const today = todayIST()
  const lb = computeLeaderboard(results)
  const done = new Set(Object.keys(results).map(Number))

  // Fetch added_by usernames
  useEffect(() => {
    async function fetchAdders() {
      const uids = new Set<string>()
      for (const r of Object.values(results)) {
        if (r.added_by && typeof r.added_by === 'string') uids.add(r.added_by)
      }
      if (uids.size === 0) return

      const sb = createClient()
      const { data } = await sb.from('profiles').select('id, username').in('id', Array.from(uids))
      const map: Record<string, string> = {}
      for (const row of data ?? []) {
        if (row.username) map[row.id] = row.username
      }
      setAddedByNames(map)
    }
    fetchAdders()
  }, [results])

  // Separate match categories
  const todayMatches = LEAGUE_SCHEDULE.filter(m => m.date === today)
  const pastUndone = LEAGUE_SCHEDULE.filter(m => m.date < today && !done.has(m.match)).sort((a, b) => b.date.localeCompare(a.date))
  const upcoming = LEAGUE_SCHEDULE.filter(m => m.date > today).sort((a, b) => a.date.localeCompare(b.date))
  const completedMatches = LEAGUE_SCHEDULE.filter(m => done.has(m.match)).sort((a, b) => b.match - a.match)

  /* chart data */
  const chartData = lb.map(e => ({ name: e.player, pts: e.leaguePoints, fp: Math.round(e.totalFantasy), rank: e.rank })).sort((a, b) => a.name.localeCompare(b.name))

  function getAddedByName(matchNum: number) {
    const r = results[matchNum]
    if (!r?.added_by || typeof r.added_by !== 'string') return null
    return addedByNames[r.added_by] ?? null
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8,9,14,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={16} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1 }}>{TOURNAMENT_NAME}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', marginTop: 1 }}>Fantasy Tracker</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-2)' }}>
            <UserIcon size={12} />
            {displayName}
          </div>
          {/* <form action={logout}>
            <button type="submit" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <LogOut size={13} /> Sign out
            </button>
          </form> */}
        </div>
      </nav>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px 100px' }}>
        {/* STATS */}
        <div className="dashboard-stats stagger">
          {[
            { label: 'Total Matches', val: '70', icon: <Calendar size={16} />, color: 'var(--accent)' },
            { label: 'Completed', val: String(done.size), icon: <CheckCircle size={16} />, color: 'var(--green)' },
            { label: 'Remaining', val: String(70 - done.size), icon: <BarChart2 size={16} />, color: 'var(--gold)' },
          ].map(s => (
            <div key={s.label} className="card stat-card" style={{ padding: '18px 20px' }}>
              <div className="stat-card-icon" style={{
                width: 38, height: 38, borderRadius: 10,
                background: `color-mix(in srgb, ${s.color} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${s.color} 25%, transparent)`,
                color: s.color,
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 3, fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="tabs" style={{ marginBottom: 24, maxWidth: 360 }}>
          {(['matches', 'leaderboard'] as const).map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              {t === 'matches' ? <Calendar size={14} /> : <BarChart2 size={14} />}
              {t === 'matches' ? 'Matches' : 'Leaderboard'}
            </button>
          ))}
        </div>

        {/* ══ MATCHES TAB ════════════════════════════════════ */}
        {tab === 'matches' && (
          <div className="animate-fade-up">
            {/* Today's Matches */}
            {todayMatches.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 12px var(--accent-glow)' }} />
                  Today&apos;s Matches
                </h2>
                <div className="scroll-list">
                  {todayMatches.map(match => (
                    <MatchCard key={match.match} match={match} isToday={true} isFuture={false}
                      isDone={done.has(match.match)} mResult={results[match.match]}
                      onAddResult={() => setAddMatch(match)} addedByName={getAddedByName(match.match)} />
                  ))}
                </div>
              </div>
            )}

            {/* Past matches needing results */}
            {pastUndone.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-2)' }}>
                  Needs Result
                </h2>
                <div className="scroll-list">
                  {pastUndone.map(match => (
                    <MatchCard key={match.match} match={match} isToday={false} isFuture={false}
                      isDone={false} mResult={undefined}
                      onAddResult={() => setAddMatch(match)} addedByName={null} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed this page — link to full results page */}
            {completedMatches.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-2)' }}>
                    Recently Completed
                  </h2>
                  <Link href="/dashboard/completed" className="btn btn-ghost btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
                    View All <ChevronRight size={13} />
                  </Link>
                </div>
                <div className="scroll-list">
                  {completedMatches.slice(0, 5).map(match => (
                    <MatchCard key={match.match} match={match} isToday={false} isFuture={false}
                      isDone={true} mResult={results[match.match]}
                      onAddResult={() => { }} addedByName={getAddedByName(match.match)} />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming — locked */}
            {upcoming.length > 0 && (
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-3)' }}>
                  Upcoming Matches
                </h2>
                <div className="scroll-list">
                  {upcoming.slice(0, 10).map(match => (
                    <MatchCard key={match.match} match={match} isToday={false} isFuture={true}
                      isDone={false} mResult={undefined}
                      onAddResult={() => { }} addedByName={null} />
                  ))}
                  {upcoming.length > 10 && (
                    <div style={{ textAlign: 'center', padding: 12, color: 'var(--text-3)', fontSize: '0.82rem' }}>
                      + {upcoming.length - 10} more upcoming matches
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ LEADERBOARD TAB ════════════════════════════════ */}
        {tab === 'leaderboard' && (
          <div>
            {/* Chart */}
            <div className="card" style={{ padding: '20px 20px 12px', marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>League Points</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: 16 }}>Standing after {done.size} matches</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ left: -20, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#c5c9d4', fontSize: 11 }} axisLine={false} tickLine={false} angle={-25} textAnchor="end" height={55} />
                  <YAxis tick={{ fill: '#c5c9d4', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1e2333', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12, color: '#f4f5f7' }}
                    labelStyle={{ color: '#f4f5f7', fontWeight: 600 }}
                    itemStyle={{ color: '#c5c9d4' }}
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  />
                  <Bar dataKey="pts" name="League Pts" radius={[5, 5, 0, 0]}>
                    {chartData.map((entry, i) => <Cell key={i} fill={rankColor(entry.rank)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Fantasy Points chart */}
            <div className="card" style={{ padding: '20px 20px 12px', marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>Total Fantasy Points</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: 16 }}>Cumulative fantasy points scored</div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData} margin={{ left: -20, right: 8 }}>
                  <defs>
                    <linearGradient id="fp-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#c5c9d4', fontSize: 11 }} axisLine={false} tickLine={false} angle={-25} textAnchor="end" height={55} />
                  <YAxis tick={{ fill: '#c5c9d4', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1e2333', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12, color: '#f4f5f7' }}
                    labelStyle={{ color: '#f4f5f7', fontWeight: 600 }}
                    itemStyle={{ color: '#c5c9d4' }}
                  />
                  <Area type="monotone" dataKey="fp" name="Fantasy Pts" stroke="var(--accent)" strokeWidth={2} fill="url(#fp-grad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Player rows */}
            <div className="scroll-list stagger">
              {lb.map(entry => {
                const isFirst = entry.rank === 1, isLast = entry.rank === 7
                const msg = isFirst ? ROYAL_MESSAGES[0] : isLast ? HUMILIATION_MESSAGES[0] : entry.rank === 6 ? SECOND_LAST_MESSAGES[0] : null

                return (
                  <div key={entry.player}
                    className={`card ${isFirst ? 'rank-1' : ''} ${isLast ? 'rank-7' : ''} ${isFirst ? 'animate-pulse-gold' : ''} ${isLast ? 'animate-pulse-red' : ''}`}
                    style={{ padding: '16px 20px' }}>
                    <div className="lb-row">
                      <div className="rank-badge" style={{
                        background: isFirst ? 'rgba(240,180,41,0.15)' : isLast ? 'rgba(240,64,64,0.12)' : 'var(--bg-2)',
                        border: `1px solid ${isFirst ? 'rgba(240,180,41,0.4)' : isLast ? 'rgba(240,64,64,0.3)' : 'var(--border)'}`,
                        color: rankColor(entry.rank),
                      }}>
                        {isFirst ? <Crown size={16} /> : isLast ? <Skull size={14} /> : `#${entry.rank}`}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: isFirst ? 'var(--gold)' : isLast ? 'var(--red)' : 'var(--text-1)' }}>
                          {entry.player}
                        </div>
                        {msg && (
                          <div style={{ fontSize: '0.72rem', color: isFirst ? 'var(--gold)' : 'var(--orange)', marginTop: 2, fontStyle: 'italic', opacity: 0.8 }}>
                            {msg}
                          </div>
                        )}
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-3)', marginTop: 2 }}>
                          {entry.matchesPlayed} matches · {entry.totalFantasy.toFixed(0)} total fantasy pts
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', color: rankColor(entry.rank), lineHeight: 1 }}>
                          {entry.leaguePoints}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', marginTop: 2 }}>league pts</div>
                      </div>
                    </div>
                    {done.size > 0 && (
                      <div style={{ marginTop: 12, height: 3, borderRadius: 2, background: 'var(--bg-3)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 2,
                          width: `${Math.min(100, (entry.leaguePoints / (10 * done.size)) * 100)}%`,
                          background: isFirst ? 'var(--gold)' : isLast ? 'var(--red)' : 'var(--accent)',
                          transition: 'width 1s ease',
                        }} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="card-flat" style={{ padding: '14px 18px', marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 600, marginRight: 4 }}>SCORING:</span>
              {RANK_POINTS.map((p, i) => (
                <div key={i} className="badge badge-muted">#{i + 1} = {p}pts</div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* FAB */}
      {!chatOpen && (
        <button onClick={() => setChatOpen(true)}
          style={{
            position: 'fixed', bottom: 24, right: 24, width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg,var(--accent),var(--accent-2))',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 28px var(--accent-glow)', zIndex: 80,
            transition: 'transform 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
        >
          <MessageSquare size={20} color="white" />
        </button>
      )}

      {chatOpen && (
        <ChatPanel onClose={() => setChatOpen(false)}
          lbContext={getLBContext(lb)} matchContext={getMatchContext(results)}
          username={displayName} upcomingContext={getUpcomingContext(today)} />
      )}

      {addMatch && <AddResultModal match={addMatch} onClose={() => setAddMatch(null)} onSaved={setResults} userId={user.id} />}
    </div>
  )
}
