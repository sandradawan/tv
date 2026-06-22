import { useState, useEffect, useRef } from 'react'
import './ImageSlideshow.css'

// ── Slide definitions ─────────────────────────────────────────────────────────
// Add your own real flyer images to /public/assets/ and list them here.
const SLIDES = [
  {
    src:     '/assets/gombe.jpeg',
    caption: 'Gombe State',
    sub:     'Imperialvilla Developments',
  },
  {
    src:     '/assets/jalingo.jpeg',
    caption: 'Jalingo Development',
    sub:     'Exquisite Residential Projects in Taraba',
  },
  {
    src:     '/assets/hmm.png',
    caption: 'Modern Architectural Design',
    sub:     'Innovative Conceptions for Luxury Villas',
  },
  {
    src:     '/assets/IMG-20260622-WA0055.jpg',
    caption: 'Modern Exterior View',
    sub:     'Elegant Aesthetics & Contemporary Style',
  },
  {
    src:     '/assets/IMG-20260622-WA0064.jpg',
    caption: 'Luxury Living Spaces',
    sub:     'Designed for Comfort and Sophistication',
  },
  {
    src:     '/assets/IMG-20260622-WA0068.jpg',
    caption: 'Scenic Overview',
    sub:     'Master-Planned Communities by Imperialvilla',
  },
  {
    src:     '/assets/IMG-20260622-WA0069.jpg',
    caption: 'Villa Entrance',
    sub:     'Welcoming Grandeur & Refined Entryways',
  },
  {
    src:     '/assets/IMG-20260622-WA0075.jpg',
    caption: 'Sunset Site View',
    sub:     'Dedicated to Shaping Tomorrow\'s Skyline',
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
