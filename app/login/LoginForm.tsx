'use client'

import { login, signup } from './actions'
import { useState, use } from 'react'
import { Trophy, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'

export default function LoginForm({ searchParamsPromise }: { searchParamsPromise: Promise<{ error?: string }> }) {
  const searchParams = use(searchParamsPromise)
  const errorMsg = searchParams?.error || ''
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const isSuccess = errorMsg.toLowerCase().includes('check your email')

  return (
    <div className="bg-grid" style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(59,107,255,0.15), var(--bg))',
      padding: '24px 16px',
    }}>
      {/* Glow orbs */}
      <div style={{
        position:'fixed', top:'15%', left:'8%', width:480, height:480,
        background:'radial-gradient(circle, rgba(59,107,255,0.06) 0%, transparent 65%)',
        borderRadius:'50%', pointerEvents:'none', filter:'blur(24px)',
      }}/>
      <div style={{
        position:'fixed', bottom:'10%', right:'5%', width:400, height:400,
        background:'radial-gradient(circle, rgba(240,180,41,0.05) 0%, transparent 65%)',
        borderRadius:'50%', pointerEvents:'none', filter:'blur(32px)',
      }}/>

      <div style={{ width:'100%', maxWidth:400, position:'relative', zIndex:1 }} className="animate-fade-up">
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            width:56, height:56, borderRadius:14,
            background:'linear-gradient(135deg, var(--accent), var(--accent-2))',
            marginBottom:16,
            boxShadow:'0 8px 32px var(--accent-glow)',
          }}>
            <Trophy size={26} color="white" />
          </div>
          <h1 style={{ fontSize:'1.75rem', fontWeight:700, color:'var(--text-1)', marginBottom:6 }}>
            IPL 2026 Fantasy
          </h1>
          <p style={{ color:'var(--text-3)', fontSize:'0.875rem' }}>
            Sign in to track scores and dominate
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding:28 }}>
          {/* Tabs */}
          <div className="tabs" style={{ marginBottom:24 }}>
            <button className={`tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')} type="button">
              Sign In
            </button>
            <button className={`tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => setMode('signup')} type="button">
              Sign Up
            </button>
          </div>

          {/* Error / success banner */}
          {errorMsg && (
            <div style={{
              display:'flex', alignItems:'flex-start', gap:10, marginBottom:20,
              padding:'12px 14px', borderRadius:'var(--radius-sm)',
              background: isSuccess ? 'rgba(34,197,94,0.08)' : 'rgba(240,64,64,0.08)',
              border: `1px solid ${isSuccess ? 'rgba(34,197,94,0.2)' : 'rgba(240,64,64,0.2)'}`,
              color: isSuccess ? 'var(--green)' : 'var(--red)',
              fontSize:'0.85rem', lineHeight:1.5,
            }}>
              {isSuccess
                ? <CheckCircle size={16} style={{ flexShrink:0, marginTop:1 }}/>
                : <AlertCircle size={16} style={{ flexShrink:0, marginTop:1 }}/>
              }
              {errorMsg}
            </div>
          )}

          {/* Login */}
          {mode === 'login' && (
            <form style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.78rem', fontWeight:600, color:'var(--text-3)', marginBottom:7, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                  <Mail size={12}/> Email
                </label>
                <input name="email" type="email" required placeholder="you@example.com" className="input" autoComplete="email"/>
              </div>
              <div>
                <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.78rem', fontWeight:600, color:'var(--text-3)', marginBottom:7, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                  <Lock size={12}/> Password
                </label>
                <input name="password" type="password" required placeholder="••••••••" className="input" autoComplete="current-password"/>
              </div>
              <button formAction={login} className="btn btn-primary btn-lg" style={{ marginTop:4, width:'100%' }}>
                Sign In
              </button>
            </form>
          )}

          {/* Signup */}
          {mode === 'signup' && (
            <form style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.78rem', fontWeight:600, color:'var(--text-3)', marginBottom:7, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                  <Mail size={12}/> Email
                </label>
                <input name="email" type="email" required placeholder="you@example.com" className="input" autoComplete="email"/>
              </div>
              <div>
                <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.78rem', fontWeight:600, color:'var(--text-3)', marginBottom:7, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                  <Lock size={12}/> Password
                </label>
                <input name="password" type="password" required placeholder="Min 6 characters" className="input" autoComplete="new-password"/>
              </div>
              <button formAction={signup} className="btn btn-primary btn-lg" style={{ marginTop:4, width:'100%' }}>
                Create Account
              </button>
            </form>
          )}

          <p style={{ textAlign:'center', fontSize:'0.8rem', color:'var(--text-3)', marginTop:20 }}>
            {mode === 'login' ? "No account? " : "Have an account? "}
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              style={{ color:'var(--accent)', background:'none', border:'none', cursor:'pointer', fontWeight:600, fontSize:'0.8rem' }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <p style={{ textAlign:'center', fontSize:'0.72rem', color:'var(--text-3)', marginTop:20 }}>
          TATA IPL 2026 · 7 Players · 70 Matches
        </p>
      </div>
    </div>
  )
}
