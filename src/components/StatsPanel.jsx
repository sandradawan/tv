import { useState, useEffect, useRef } from 'react'
import './StatsPanel.css'

// ── Historical data simulation for Line Chart ────────────────────────────────
function generateHistoricalData(currentVal) {
  if (!currentVal) return []
  // Simulate 6 months of client growth ending at current value
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const start = Math.round(currentVal * 0.82)
  const step  = (currentVal - start) / 5
  return months.map((m, idx) => ({
    label: m,
    value: Math.round(start + step * idx + (Math.random() - 0.5) * currentVal * 0.02)
  }))
}

// ── Upgraded StatsPanel ───────────────────────────────────────────────────────
export default function StatsPanel({ stats, loading, error }) {
  const [activeSegment, setActiveSegment] = useState(null)

  if (loading) {
    return (
      <div className="stats-panel stats-panel--skeleton">
        <p className="stats-panel__heading">Live Statistics</p>
        <div className="widget-card skel-widget" />
        <div className="widget-card skel-widget" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="stats-panel">
        <p className="stats-panel__heading">Live Statistics</p>
        <div className="stats-error animate-fade-in">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="stats-error__title">Unable to load stats</p>
          <p className="stats-error__msg">{error}</p>
        </div>
      </div>
    )
  }

  // Define data segments
  const totalClients = stats?.total_clients ?? 0
  const totalAgents  = stats?.total_agents ?? 0
  const totalStaff   = stats?.total_staff ?? 0
  const totalPending = stats?.pending_approvals ?? 0

  // 1. Donut segment calculation (visual scaling so small numbers are visible)
  const segments = [
    { label: 'Clients',   val: totalClients, color: '#3b82f6', weight: 45 },
    { label: 'Staff',     val: totalStaff,   color: '#6366f1', weight: 25 },
    { label: 'Agents',    val: totalAgents,  color: '#10b981', weight: 18 },
    { label: 'Pending',   val: totalPending, color: '#f59e0b', weight: 12 },
  ]

  const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0)
  const donutRadius = 38
  const circ = 2 * Math.PI * donutRadius // ~238.76
  
  let currentOffset = 0

  // 2. Line chart calculation (Monthly Client Growth)
  const lineData = generateHistoricalData(totalClients)
  const chartW = 320
  const chartH = 90
  const padX = 24
  const padY = 12

  const minV = lineData.length ? Math.min(...lineData.map(d => d.value)) * 0.99 : 0
  const maxV = lineData.length ? Math.max(...lineData.map(d => d.value)) * 1.01 : 1
  const valRange = maxV - minV || 1

  const getX = (index) => padX + (index / (lineData.length - 1)) * (chartW - padX * 2)
  const getY = (val) => chartH - padY - ((val - minV) / valRange) * (chartH - padY * 2)

  // Build curved bezier path
  let pathD = ''
  let areaD = ''
  if (lineData.length > 0) {
    pathD = `M ${getX(0)} ${getY(lineData[0].value)}`
    for (let i = 1; i < lineData.length; i++) {
      const xPrev = getX(i - 1)
      const yPrev = getY(lineData[i - 1].value)
      const xCurr = getX(i)
      const yCurr = getY(lineData[i].value)
      // Control points for smooth bezier spline
      const cpX1 = xPrev + (xCurr - xPrev) / 2
      const cpY1 = yPrev
      const cpX2 = xPrev + (xCurr - xPrev) / 2
      const cpY2 = yCurr
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${xCurr} ${yCurr}`
    }
    // Area close
    areaD = `${pathD} L ${getX(lineData.length - 1)} ${chartH - padY} L ${getX(0)} ${chartH - padY} Z`
  }

  return (
    <div className="stats-panel animate-fade-in-up">
      <p className="stats-panel__heading">
        <span className="stats-heading-dot" />
        Live Statistics
      </p>

      {/* ── Donut Chart Widget ── */}
      <div className="widget-card widget-donut">
        <div className="widget-header">
          <span className="widget-header__title">Distribution Mix</span>
          <span className="widget-header__sub">Active Roles</span>
        </div>

        <div className="donut-content">
          <div className="donut-svg-wrapper">
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={donutRadius}
                fill="transparent"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="10"
              />
              {/* Donut segments */}
              {segments.map((seg, idx) => {
                const strokeLength = (seg.weight / totalWeight) * circ
                const strokeOffset = currentOffset
                currentOffset -= strokeLength

                const isHovered = activeSegment === idx

                return (
                  <circle
                    key={seg.label}
                    cx="50"
                    cy="50"
                    r={donutRadius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={isHovered ? 13 : 10}
                    strokeDasharray={`${strokeLength} ${circ - strokeLength}`}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    className="donut-segment"
                    style={{ transition: 'stroke-width 0.3s ease, stroke 0.3s ease' }}
                    onMouseEnter={() => setActiveSegment(idx)}
                    onMouseLeave={() => setActiveSegment(null)}
                  />
                )
              })}
            </svg>
            <div className="donut-center">
              <span className="donut-center__val">
                {activeSegment !== null ? segments[activeSegment].val.toLocaleString() : (totalClients + totalStaff + totalAgents).toLocaleString()}
              </span>
              <span className="donut-center__lbl">
                {activeSegment !== null ? segments[activeSegment].label : 'Total Users'}
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
          <span className="widget-header__title">Client Growth Trend</span>
          <span className="widget-header__sub">Monthly Registrations</span>
        </div>

        <div className="line-chart-wrapper">
          <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" height="100%">
            <defs>
              <linearGradient id="line-area-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1={padX} y1={getY(minV)} x2={chartW - padX} y2={getY(minV)} stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
            <line x1={padX} y1={getY((maxV + minV) / 2)} x2={chartW - padX} y2={getY((maxV + minV) / 2)} stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
            <line x1={padX} y1={getY(maxV)} x2={chartW - padX} y2={getY(maxV)} stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />

            {/* Area Fill */}
            {areaD && <path d={areaD} fill="url(#line-area-grad)" />}

            {/* Bezier Line */}
            {pathD && <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />}

            {/* Interaction Dots / Labels */}
            {lineData.map((d, idx) => {
              const x = getX(idx)
              const y = getY(d.value)
              return (
                <g key={d.label} className="chart-node">
                  <circle cx={x} cy={y} r="3" fill="#fff" stroke="#3b82f6" strokeWidth="1.5" />
                  <text x={x} y={chartH - 2} textAnchor="middle" className="chart-axis-lbl">
                    {d.label}
                  </text>
                  <text x={x} y={y - 8} textAnchor="middle" className="chart-node-lbl">
                    {d.value}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>
    </div>
  )
}
