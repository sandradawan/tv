import { useState, useEffect } from 'react'
import './Header.css'

const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function Header({ lastSync }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const hh   = String(now.getHours()).padStart(2, '0')
  const mm   = String(now.getMinutes()).padStart(2, '0')
  const ss   = String(now.getSeconds()).padStart(2, '0')
  const day  = DAYS[now.getDay()]
  const date = `${day}, ${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`

  const syncText = lastSync
    ? `Updated ${lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'Connecting…'

  return (
    <header className="dashboard-header animate-fade-in">

      {/* ── Brand ── */}
      <div className="header-brand">
        <img
          src="/assets/logo.png"
          alt="Imperialvilla logo"
          className="logo-img"
        />
        <div className="brand-text">
          <span className="brand-name">Imperialvilla</span>
          <span className="brand-tagline">Property Development Limited</span>
        </div>
      </div>

      {/* ── Date ── */}
      <div className="header-date">
        <span className="date-string">{date}</span>
        <span className="sync-badge">
          <span className="sync-dot" />
          <span className="sync-label">{syncText}</span>
        </span>
      </div>

      {/* ── Clock ── */}
      <div className="header-clock" aria-label={`Time: ${hh}:${mm}:${ss}`}>
        <span className="clock-hhmm">
          {hh}<span className="clock-colon">:</span>{mm}
        </span>
        <span className="clock-ss">{ss}</span>
      </div>

    </header>
  )
}
