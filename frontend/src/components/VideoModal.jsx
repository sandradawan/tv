import { useRef, useState, useEffect } from 'react'
import './VideoModal.css'

// ── Video playlist ────────────────────────────────────────────────────────────
// Replace with your real MP4 URLs (company jingles, branch tours, etc.)
const PLAYLIST = [
  {
    src:   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    label: 'Imperialvilla — Branch Highlights',
  },
  {
    src:   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    label: 'Our Properties',
  },
  {
    src:   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    label: 'Meet Our Team',
  },
  {
    src:   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    label: 'Excellence in Every Build',
  },
]

export default function VideoModal({ durationMs, onClose }) {
  const videoRef   = useRef(null)
  const [index, setIndex]         = useState(0)
  const [visible, setVisible]     = useState(false)   // controls CSS entrance
  const [closing, setClosing]     = useState(false)   // controls CSS exit
  const [timeLeft, setTimeLeft]   = useState(Math.round(durationMs / 1000))

  // ── Entrance animation ──
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  // ── Countdown ticker ──
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(id)
  }, [])

  // ── Smooth close ──
  const handleClose = () => {
    setClosing(true)
    setTimeout(onClose, 500)
  }

  // Auto-close when parent says time is up (timeLeft hits 0)
  useEffect(() => {
    if (timeLeft <= 0) handleClose()
  }, [timeLeft])

  // ── Next video on end ──
  const handleEnded = () => {
    setIndex(prev => (prev + 1) % PLAYLIST.length)
  }

  useEffect(() => {
    videoRef.current?.load()
    videoRef.current?.play().catch(() => {})
  }, [index])

  const mm = String(Math.floor(Math.max(0, timeLeft) / 60)).padStart(2, '0')
  const ss = String(Math.max(0, timeLeft) % 60).padStart(2, '0')

  return (
    <div
      className={`vmodal-backdrop ${visible ? 'vmodal-backdrop--in' : ''} ${closing ? 'vmodal-backdrop--out' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Video player"
    >
      <div className={`vmodal-window ${visible ? 'vmodal-window--in' : ''} ${closing ? 'vmodal-window--out' : ''}`}>

        {/* ── Top bar ── */}
        <div className="vmodal-topbar">
          <div className="vmodal-topbar__brand">
            <img src="/assets/logo.png" alt="Imperialvilla" className="vmodal-logo" />
            <span className="vmodal-topbar__title">{PLAYLIST[index].label}</span>
          </div>
          <div className="vmodal-topbar__right">
            <span className="vmodal-countdown" aria-label={`Closes in ${mm}:${ss}`}>
              ⏱ {mm}:{ss}
            </span>
            <button className="vmodal-close" onClick={handleClose} aria-label="Close video">
              ✕
            </button>
          </div>
        </div>

        {/* ── Video ── */}
        <div className="vmodal-player">
          <video
            ref={videoRef}
            key={PLAYLIST[index].src}
            className="vmodal-video"
            src={PLAYLIST[index].src}
            muted
            autoPlay
            playsInline
            onEnded={handleEnded}
          />

          {/* Dot nav */}
          <nav className="vmodal-dots" aria-label="Playlist">
            {PLAYLIST.map((_, i) => (
              <button
                key={i}
                className={`vmodal-dot ${i === index ? 'vmodal-dot--active' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`Play video ${i + 1}`}
              />
            ))}
          </nav>
        </div>

        {/* ── Progress bar depleting over durationMs ── */}
        <div className="vmodal-progress">
          <div
            className="vmodal-progress__bar"
            style={{ animationDuration: `${durationMs}ms` }}
          />
        </div>

      </div>
    </div>
  )
}
