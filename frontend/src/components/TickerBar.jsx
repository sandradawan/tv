import { useState, useEffect, useRef } from 'react'
import './TickerBar.css'

// ── Ticker messages — customise as needed ────────────────────────────────────
const TICKER_MESSAGES = [
  '🌟  Welcome to IPVL! We appreciate your patience and look forward to serving you.',
  '📋  Please have your identification and documents ready for a faster process.',
  '☕  Complimentary refreshments are available in the waiting area.',
  '📞  Need assistance? Speak to any of our friendly staff members.',
  '🔒  Your data and privacy are fully protected under our strict security policy.',
  '⏰  Operating Hours: Monday – Friday  |  8:00 AM – 5:00 PM',
  '🌐  Visit our website at www.ipvl.com for online services and support.',
  '💡  Tip: You can pre-register online to reduce your waiting time!',
]

export default function TickerBar() {
  const [msgIndex, setMsgIndex] = useState(0)
  const [visible, setVisible]   = useState(true)

  // Cycle messages every 12 seconds with a fade transition
  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setMsgIndex(prev => (prev + 1) % TICKER_MESSAGES.length)
        setVisible(true)
      }, 500)
    }, 12_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="ticker-wrapper" role="marquee" aria-live="polite" aria-atomic="true">
      {/* Label pill */}
      <div className="ticker-label">
        <span className="ticker-label__dot" />
        <span>NOTICE</span>
      </div>

      {/* Message area */}
      <div className="ticker-track">
        <p className={`ticker-msg ${visible ? 'ticker-msg--visible' : 'ticker-msg--hidden'}`}>
          {TICKER_MESSAGES[msgIndex]}
        </p>
      </div>
    </div>
  )
}
