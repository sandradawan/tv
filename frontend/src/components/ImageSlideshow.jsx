import { useState, useEffect, useRef } from 'react'
import './ImageSlideshow.css'

// ── Slide definitions ─────────────────────────────────────────────────────────
// Add your own real flyer images to /public/assets/ and list them here.
const SLIDES = [
  {
    src:     '/assets/flyer4.png',
    caption: 'Welcome to Imperialvilla',
    sub:     'Excellence in Every Build',
  },
  {
    src:     '/assets/flyer1.png',
    caption: 'Find Your Dream Home',
    sub:     'Premium Properties Across Nigeria',
  },
  {
    src:     '/assets/flyer2.png',
    caption: 'Invest in Real Estate Today',
    sub:     'Secure Your Future With Smart Property Investments',
  },
  {
    src:     '/assets/flyer3.png',
    caption: 'Our Services',
    sub:     'Sales · Management · Acquisition · Leasing',
  },
]

const SLIDE_DURATION = 7000  // ms each slide is visible
const TRANSITION_MS  = 800   // CSS crossfade duration

export default function ImageSlideshow() {
  const [current, setCurrent]   = useState(0)
  const [prev,    setPrev]      = useState(null)
  const [fading,  setFading]    = useState(false)
  const timerRef = useRef(null)

  const goTo = (idx) => {
    if (fading) return
    setPrev(current)
    setFading(true)
    setTimeout(() => {
      setCurrent(idx)
      setPrev(null)
      setFading(false)
    }, TRANSITION_MS)
  }

  const goNext = () => goTo((current + 1) % SLIDES.length)

  // Auto-advance
  useEffect(() => {
    timerRef.current = setInterval(goNext, SLIDE_DURATION)
    return () => clearInterval(timerRef.current)
  }, [current, fading])

  return (
    <div className="slideshow-root">

      {/* Previous slide fading out */}
      {prev !== null && (
        <div className="slide slide--out" key={`out-${prev}`}>
          <img src={SLIDES[prev].src} alt={SLIDES[prev].caption} className="slide-img" />
          <div className="slide-overlay" />
        </div>
      )}

      {/* Current slide fading in */}
      <div className={`slide slide--in ${fading ? 'slide--fading' : ''}`} key={`in-${current}`}>
        <img
          src={SLIDES[current].src}
          alt={SLIDES[current].caption}
          className="slide-img"
        />
        <div className="slide-overlay" />

        {/* Caption */}
        <div className="slide-caption animate-fade-in-up delay-200">
          <p className="slide-caption__title">{SLIDES[current].caption}</p>
          <p className="slide-caption__sub">{SLIDES[current].sub}</p>
        </div>
      </div>

      {/* Dot navigation */}
      <nav className="slideshow-dots" aria-label="Slide navigation">
        {SLIDES.map((s, i) => (
          <button
            key={i}
            className={`slideshow-dot ${i === current ? 'slideshow-dot--active' : ''}`}
            aria-label={`Go to slide: ${s.caption}`}
            onClick={() => goTo(i)}
          />
        ))}
      </nav>

      {/* Progress bar */}
      <div className="slideshow-progress" key={`prog-${current}`}>
        <div className="slideshow-progress__bar" style={{ animationDuration: `${SLIDE_DURATION}ms` }} />
      </div>

    </div>
  )
}
