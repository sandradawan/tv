import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header.jsx'
import MediaShowcase from './components/MediaShowcase.jsx'
import StatsPanel from './components/StatsPanel.jsx'
import TickerBar from './components/TickerBar.jsx'
import './App.css'

// ── Config ───────────────────────────────────────────────────────────────────
const API_URL            = import.meta.env.VITE_API_URL || 'https://system.imperialvillapropertydevelopment.com/api/api-stats.php'
const POLL_INTERVAL      = Number(import.meta.env.VITE_POLL_INTERVAL)  || 60_000

export default function App() {
  const [stats,    setStats]    = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [lastSync, setLastSync] = useState(null)

  // Track mediaMode to blur header/ticker when video plays
  const [mediaMode, setMediaMode] = useState('video')

  // ── Stats polling ─────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res  = await fetch(API_URL, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10_000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'API error')
      setStats(json.data)
      setError(null)
      setLastSync(new Date())
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    const id = setInterval(fetchStats, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [fetchStats])

  return (
    <div className={`dashboard-root ${mediaMode === 'video' ? 'dashboard-root--video-active' : ''}`}>
      {/* Ambient background orbs */}
      <div className="bg-orbs" aria-hidden="true">
        <span className="bg-orb bg-orb--1" />
        <span className="bg-orb bg-orb--2" />
        <span className="bg-orb bg-orb--3" />
      </div>
      <div className="bg-grid" aria-hidden="true" />

      {/* Header */}
      <Header lastSync={lastSync} />

      {/* Main: Combined Media Showcase left, Stats right */}
      <main className="dashboard-body">
        <section className="slideshow-section">
          <MediaShowcase onModeChange={setMediaMode} />
        </section>
        <aside className="stats-section">
          <StatsPanel stats={stats} loading={loading} error={error} />
        </aside>
      </main>

      {/* Ticker */}
      <TickerBar />
    </div>
  )
}
