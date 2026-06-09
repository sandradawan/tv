import { useRef, useState, useEffect } from 'react'
import './VideoPlayer.css'

// ── Playlist ────────────────────────────────────────────────────────────────
// Replace these with your real branch/jingle MP4 URLs.
// These are freely available Big Buck Bunny clips from a public CDN.
const PLAYLIST = [
  {
    src:   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    label: 'Welcome to IPVL',
  },
  {
    src:   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    label: 'Our Services',
  },
  {
    src:   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    label: 'Branch Highlights',
  },
  {
    src:   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    label: 'Community Impact',
  },
  {
    src:   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    label: 'Our Team',
  },
]

export default function VideoPlayer() {
  const videoRef   = useRef(null)
  const [index, setIndex]         = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [fadeClass, setFadeClass] = useState('vp-fade-in')

  const goToNext = () => {
    setFadeClass('vp-fade-out')
    setTimeout(() => {
      setIndex(prev => (prev + 1) % PLAYLIST.length)
      setIsLoading(true)
      setFadeClass('vp-fade-in')
    }, 400)
  }

  // When index changes, load and play the new video
  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return
    vid.load()
    vid.play().catch(() => {
      // Some browsers require a user gesture first — muted+autoplay should bypass this
    })
  }, [index])

  const current = PLAYLIST[index]

  return (
    <div className="vp-root">
      {/* Loading shimmer */}
      {isLoading && <div className="vp-shimmer" aria-hidden="true" />}

      {/* HTML5 Video */}
      <video
        ref={videoRef}
        key={current.src}          /* forces re-mount on src change */
        className={`vp-video ${fadeClass}`}
        src={current.src}
        muted
        autoPlay
        playsInline
        onCanPlay={() => setIsLoading(false)}
        onEnded={goToNext}
      />

      {/* Gradient overlay — bottom */}
      <div className="vp-overlay" aria-hidden="true" />

      {/* Now Playing label */}
      <div className="vp-label animate-fade-in-up delay-200">
        <span className="vp-label-icon">▶</span>
        <span className="vp-label-text">{current.label}</span>
      </div>

      {/* Dot navigation */}
      <nav className="vp-dots" aria-label="Playlist navigation">
        {PLAYLIST.map((item, i) => (
          <button
            key={i}
            className={`vp-dot ${i === index ? 'vp-dot--active' : ''}`}
            aria-label={`Play: ${item.label}`}
            onClick={() => { setIndex(i); setIsLoading(true) }}
          />
        ))}
      </nav>
    </div>
  )
}
