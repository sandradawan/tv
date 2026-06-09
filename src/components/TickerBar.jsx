import './TickerBar.css'

const TICKER_MESSAGES = [
  '🌟  Welcome to Imperialvilla Property Development Limited — Your Trusted Real Estate Partner',
  '🏠  Premium Properties Available Now — Contact Our Sales Team For Exclusive Offers',
  '📋  Please have your identification and documents ready for a faster check-in process',
  '☕  Complimentary refreshments are available in the waiting area',
  '📞  Need assistance? Speak to any of our friendly staff members on duty',
  '🔒  Your data and privacy are fully protected under our strict security policy',
  '⏰  Operating Hours: Monday – Friday  |  8:00 AM – 5:00 PM',
  '🌐  Visit our website for online services — www.imperialvillapropertydevelopment.com',
  '💡  Tip: Pre-register online to reduce your waiting time and get faster service',
  '🏆  Award-Winning Real Estate Services Since 2015 — Building Dreams, Creating Legacies',
]

// Join all messages into one long scrolling string
const FULL_TEXT = TICKER_MESSAGES.join('     ◆     ')

export default function TickerBar() {
  return (
    <div className="ticker-wrapper" role="marquee" aria-live="polite" aria-atomic="true">
      {/* Label pill */}
      <div className="ticker-label">
        <span className="ticker-label__dot" />
        <span>NOTICE</span>
      </div>

      {/* Continuous scrolling track */}
      <div className="ticker-track">
        <div className="ticker-scroll">
          <span className="ticker-content">{FULL_TEXT}</span>
          {/* Duplicate for seamless loop */}
          <span className="ticker-content" aria-hidden="true">{FULL_TEXT}</span>
        </div>
      </div>
    </div>
  )
}
