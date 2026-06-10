import { useState, useEffect, useRef } from 'react'
import './StatsPanel.css'

// ── Historical data simulation for Line Chart ───────────
function generateHistoricalData(currentVal) {
  if (!currentVal) return []
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const start = Math.round(currentVal * 0.82)
  const step  = (currentVal - start) / 5
  return months.map((m, idx) => ({
    label: m,
    value: Math.round(start + step * idx + (Math.random() - 0.5) * currentVal * 0.02)
  }))
}

// ── Animated count-up hook ───────────────────────────────
function useCountUp(target, duration = 1200) {
  const [display, setDisplay] = useState(0)
  const frameRef = useRef(null)

  useEffect(() => {
    if (!target) { setDisplay(0); return }
    const start = performance.now()
    const animate = (now) => {
      const elapsed  = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * target))
      if (progress < 1) frameRef.current = requestAnimationFrame(animate)
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration])

  return display
}

// ── KPI Metric Card ──────────────────────────────────────
function KPICard({ label, value, icon, color, delay }) {
  return (
    <div className={`kpi-card animate-fade-in-up delay-${delay}`} style={{ '--kpi-color': color }}>
      <div className="kpi-top">
        <div className="kpi-icon-wrap">
          {icon}
        </div>
        <span className="kpi-live-badge">
          <span className="kpi-live-dot" />
          LIVE
        </span>
      </div>
      <div className="kpi-value">{value.toLocaleString()}</div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-bar">
        <div className="kpi-bar__fill" />
      </div>
    </div>
  )
}

// ── SVG Icons ────────────────────────────────────────────
const Icons = {
  clients: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  agents: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
      <polyline points="16 11 18 13 22 9"/>
    </svg>
  ),
  staff: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  pending: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
}

// ── Upgraded StatsPanel ──────────────────────────────────
export default function StatsPanel({ stats, loading, error }) {
  const [activeSegment, setActiveSegment] = useState(null)

  // All hooks unconditionally before early returns
  const totalClients = stats?.total_clients     ?? 0
  const totalAgents  = stats?.total_agents      ?? 0
  const totalStaff   = stats?.total_staff       ?? 0
  const totalPending = stats?.pending_approvals ?? 0

  const animClients = useCountUp(totalClients, 1400)
  const animAgents  = useCountUp(totalAgents,  1600)
  const animStaff   = useCountUp(totalStaff,   1200)
  const animPending = useCountUp(totalPending, 1000)

  // Loading skeleton
  if (loading) {
    return (
      <div className="stats-panel stats-panel--skeleton">
        <div className="kpi-grid">
          {[1,2,3,4].map(i => <div key={i} className="kpi-card kpi-card--skel" />)}
        </div>
        <div className="widget-card skel-widget" />
        <div className="widget-card skel-widget" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="stats-panel">
        <div className="stats-error animate-fade-in">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="stats-error__title">Unable to load statistics</p>
          <p className="stats-error__msg">{error}</p>
        </div>
      </div>
    )
  }

  // ── Donut chart data ─────────────────────────────────────
  const segments = [
    { label: 'Clients', val: animClients, color: '#2563eb', weight: 45 },
    { label: 'Staff',   val: animStaff,   color: '#4f46e5', weight: 25 },
    { label: 'Agents',  val: animAgents,  color: '#059669', weight: 18 },
    { label: 'Pending', val: animPending, color: '#d97706', weight: 12 },
  ]

  const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0)
  const donutRadius = 38
  const circ        = 2 * Math.PI * donutRadius
  let   currentOffset = 0

  // ── Line chart data ──────────────────────────────────────
  const lineData = generateHistoricalData(totalClients)
  const chartW = 300; const chartH = 80
  const padX   = 20;  const padY   = 10

  const minV = lineData.length ? Math.min(...lineData.map(d => d.value)) * 0.98 : 0
  const maxV = lineData.length ? Math.max(...lineData.map(d => d.value)) * 1.02 : 1
  const valRange = maxV - minV || 1

  const getX = i   => padX + (i / (lineData.length - 1)) * (chartW - padX * 2)
  const getY = val => chartH - padY - ((val - minV) / valRange) * (chartH - padY * 2)

  let pathD = '', areaD = ''
  if (lineData.length > 0) {
    pathD = `M ${getX(0)} ${getY(lineData[0].value)}`
    for (let i = 1; i < lineData.length; i++) {
      const xP = getX(i-1), yP = getY(lineData[i-1].value)
      const xC = getX(i),   yC = getY(lineData[i].value)
      const cpX = xP + (xC - xP) / 2
      pathD += ` C ${cpX} ${yP}, ${cpX} ${yC}, ${xC} ${yC}`
    }
    areaD = `${pathD} L ${getX(lineData.length-1)} ${chartH - padY} L ${getX(0)} ${chartH - padY} Z`
  }

  return (
    <div className="stats-panel animate-fade-in-up">

      {/* ── Panel Header ── */}
      <div className="panel-header">
        <span className="panel-header__dot" />
        <span className="panel-header__title">Live Dashboard</span>
        <div className="panel-header__line" />
      </div>

      {/* ── KPI 2×2 Grid ── */}
      <div className="kpi-grid">
        <KPICard label="Total Clients"   value={animClients} icon={Icons.clients} color="#2563eb" delay="0" />
        <KPICard label="Active Agents"   value={animAgents}  icon={Icons.agents}  color="#059669" delay="100" />
        <KPICard label="Staff Members"   value={animStaff}   icon={Icons.staff}   color="#4f46e5" delay="200" />
        <KPICard label="Pending Reviews" value={animPending} icon={Icons.pending} color="#d97706" delay="300" />
      </div>

      {/* ── Donut Chart Widget ── */}
      <div className="widget-card widget-donut">
        <div className="widget-header">
          <span className="widget-header__title">Role Distribution</span>
          <span className="widget-header__sub">Active Roles</span>
        </div>

        <div className="donut-content">
          <div className="donut-svg-wrapper">
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              <circle cx="50" cy="50" r={donutRadius} fill="transparent"
                stroke="rgba(255,255,255,0.03)" strokeWidth="10" />
              {segments.map((seg, idx) => {
                const strokeLength = (seg.weight / totalWeight) * circ
                const strokeOffset = currentOffset
                currentOffset -= strokeLength
                const isHovered = activeSegment === idx
                return (
                  <circle key={seg.label}
                    cx="50" cy="50" r={donutRadius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={isHovered ? 13 : 10}
                    strokeDasharray={`${strokeLength} ${circ - strokeLength}`}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    className="donut-segment"
                    style={{ transition: 'stroke-width 0.3s ease' }}
                    onMouseEnter={() => setActiveSegment(idx)}
                    onMouseLeave={() => setActiveSegment(null)}
                  />
                )
              })}
            </svg>
            <div className="donut-center">
              <span className="donut-center__val">
                {activeSegment !== null
                  ? segments[activeSegment].val.toLocaleString()
                  : (totalClients + totalStaff + totalAgents).toLocaleString()}
              </span>
              <span className="donut-center__lbl">
                {activeSegment !== null ? segments[activeSegment].label : 'Total'}
              </span>
            </div>
          </div>

          <div className="donut-legend">
            {segments.map((seg, idx) => (
              <div
                key={seg.label}
                className={`legend-item ${activeSegment === idx ? 'legend-item--active' : ''}`}
                onMouseEnter={() => setActiveSegment(idx)}
                onMouseLeave={() => setActiveSegment(null)}
              >
                <span className="legend-marker" style={{ background: seg.color }} />
                <div className="legend-text">
                  <span className="legend-label">{seg.label}</span>
                  <span className="legend-value">{seg.val.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Line Chart Widget ── */}
      <div className="widget-card widget-line">
        <div className="widget-header">
          <span className="widget-header__title">Client Growth</span>
          <span className="widget-header__sub">6-Month Trend</span>
        </div>

        <div className="line-chart-wrapper">
          <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" height="100%">
            <defs>
              <linearGradient id="line-area-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#2563eb" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0"   />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1={padX} y1={getY(minV)}             x2={chartW - padX} y2={getY(minV)}             stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
            <line x1={padX} y1={getY((maxV + minV) / 2)} x2={chartW - padX} y2={getY((maxV + minV) / 2)} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
            <line x1={padX} y1={getY(maxV)}             x2={chartW - padX} y2={getY(maxV)}             stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />

            {areaD && <path d={areaD} fill="url(#line-area-grad)" />}
            {pathD && <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />}

            {lineData.map((d, idx) => (
              <g key={d.label} className="chart-node">
                <circle cx={getX(idx)} cy={getY(d.value)} r="2.5" fill="#fff" stroke="#2563eb" strokeWidth="1.5" />
                <text x={getX(idx)} y={chartH - 2} textAnchor="middle" className="chart-axis-lbl">
                  {d.label}
                </text>
                <text x={getX(idx)} y={getY(d.value) - 7} textAnchor="middle" className="chart-node-lbl">
                  {d.value}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

    </div>
  )
}
