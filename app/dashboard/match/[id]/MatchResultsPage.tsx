'use client'

import type { User } from '@supabase/supabase-js'
import type { Match, PlayerName } from '@/lib/matchData'
import Link from 'next/link'
import { ArrowLeft, Trophy, User as UserIcon, Clock, BarChart2, TrendingUp } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, CartesianGrid, LabelList,
} from 'recharts'

interface PlayerResult { player: PlayerName; fantasyPoints: number; rank: number }

interface Props {
  match: Match
  playerResults: PlayerResult[]
  addedBy: string | null
  addedAt: string | null
  currentUser: User
}

const RANK_COLORS = ['#f0b429','#c0c8d8','#cd7f32','#9ba3b2','#9ba3b2','#f97316','#f04040']
function rankColor(rank: number) { return RANK_COLORS[rank - 1] ?? '#9ba3b2' }

const RANK_LABELS = ['1st','2nd','3rd','4th','5th','6th','7th']
const RANK_ICONS  = ['#1','#2','#3','#4','#5','#6','#7']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata',
  })
}

export default function MatchResultsPage({ match, playerResults, addedBy, addedAt }: Props) {
  const chartData = playerResults.map(r => ({
    name: r.player,
    pts: r.fantasyPoints,
    rank: r.rank,
  }))

  const winner = playerResults[0]
  const lastPlace = playerResults[playerResults.length - 1]

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8,9,14,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: 58,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <Link href="/dashboard" className="btn btn-ghost btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <ArrowLeft size={15}/> Dashboard
        </Link>
        <div style={{ height: 20, width: 1, background: 'var(--border)' }}/>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)' }}>
          Match {match.match} — {match.teams}
        </div>
      </nav>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '28px 20px 80px' }}>
        {/* Header */}
        <div className="card" style={{ padding: '24px 28px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div className="badge badge-blue" style={{ marginBottom: 10 }}>Match {match.match}</div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>{match.teams}</h1>
              <p style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>
                {match.venue} · {new Date(match.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' })} · {match.time}
              </p>
            </div>
            <div className="badge badge-green" style={{ fontSize: '0.75rem' }}>
              <Trophy size={11}/> Result Added
            </div>
          </div>

          {/* Metadata */}
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            {addedBy && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.8rem', color: 'var(--text-3)' }}>
                <UserIcon size={13}/>
                <span>Added by <strong style={{ color: 'var(--text-1)' }}>{addedBy}</strong></span>
              </div>
            )}
            {addedAt && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.8rem', color: 'var(--text-3)' }}>
                <Clock size={13}/>
                {formatDate(addedAt)}
              </div>
            )}
          </div>
        </div>

        {/* Winner + Last */}
        <div className="winner-grid" style={{ marginBottom: 20 }}>
          <div className="card rank-1" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Trophy size={15} color="var(--gold)"/>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fantasy Winner</span>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--gold)' }}>{winner.player}</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1, marginTop: 4 }}>
              {winner.fantasyPoints} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-3)' }}>pts</span>
            </div>
          </div>
          <div className="card rank-7" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <TrendingUp size={15} color="var(--red)"/>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Last Place</span>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--red)' }}>{lastPlace.player}</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1, marginTop: 4 }}>
              {lastPlace.fantasyPoints} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-3)' }}>pts</span>
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="card" style={{ padding: '20px 20px 12px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <BarChart2 size={16} color="var(--accent)"/>
            <span style={{ fontWeight: 700 }}>Fantasy Points — Match {match.match}</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ left: -16, right: 8, top: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="name" tick={{ fill: '#c5c9d4', fontSize: 11 }} axisLine={false} tickLine={false} angle={-25} textAnchor="end" height={55}/>
              <YAxis tick={{ fill: '#c5c9d4', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <Tooltip
                contentStyle={{ background: '#1e2333', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12, color: '#f4f5f7' }}
                labelStyle={{ color: '#f4f5f7', fontWeight: 600 }}
                itemStyle={{ color: '#c5c9d4' }}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Bar dataKey="pts" name="Fantasy Points" radius={[5,5,0,0]}>
                <LabelList dataKey="pts" position="top" style={{ fill: 'var(--text-2)', fontSize: 11, fontWeight: 600 }}/>
                {chartData.map((d, i) => <Cell key={i} fill={rankColor(d.rank)}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Color legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {RANK_LABELS.map((l, i) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: 'var(--text-3)' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: RANK_COLORS[i] }}/>
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* Full rankings table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>
            Full Rankings
          </div>
          <div>
            {playerResults.map((r, i) => {
              const isFirst = r.rank === 1, isLast = r.rank === 7
              const maxPts = playerResults[0]?.fantasyPoints || 1
              return (
                <div key={r.player} style={{
                  padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14,
                  borderBottom: i < playerResults.length - 1 ? '1px solid var(--border)' : 'none',
                  background: isFirst ? 'rgba(240,180,41,0.04)' : isLast ? 'rgba(240,64,64,0.04)' : 'transparent',
                }}>
                  {/* Rank */}
                  <div style={{
                    width: 40, textAlign: 'center', fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: r.rank <= 3 ? '1.1rem' : '0.9rem',
                    fontWeight: 700, color: rankColor(r.rank), flexShrink: 0
                  }}>
                    {RANK_ICONS[r.rank - 1] || `#${r.rank}`}
                  </div>

                  {/* Name + Bar */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 5 }}>{r.player}</div>
                    <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-3)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 2,
                        width: `${(r.fantasyPoints / maxPts) * 100}%`,
                        background: rankColor(r.rank),
                        transition: 'width 0.8s ease',
                      }}/>
                    </div>
                  </div>

                  {/* Points */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: rankColor(r.rank), lineHeight: 1 }}>
                      {r.fantasyPoints}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>pts</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
