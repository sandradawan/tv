import { useState, useEffect, useRef, useCallback } from 'react'
import './MediaShowcase.css'

const VIDEOS = [
  { src: '/assets/video.mp4', label: 'Imperialvilla Showcase' },
  { src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', label: 'Premium Properties' },
  { src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', label: 'Luxury Living' },
]

const IMAGES = [
  { src: '/assets/flyer4.png', caption: 'Welcome to Imperialvilla', sub: 'Excellence in Every Build' },
  { src: '/assets/flyer1.png', caption: 'Find Your Dream Home', sub: 'Premium Properties Across Nigeria' },
  { src: '/assets/flyer2.png', caption: 'Invest in Real Estate Today', sub: 'Secure Your Future With Smart Investments' },
  { src: '/assets/flyer3.png', caption: 'Our Services', sub: 'Sales · Management · Acquisition · Leasing' },
]

const IMAGE_SESSION_DUR = Number(import.meta.env.VITE_IMAGE_SESSION_DUR) || 600000
const SINGLE_IMAGE_DUR  = Number(import.meta.env.VITE_SINGLE_IMAGE_DUR)  || 8000

function shuffle(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// Animated equalizer bars for the NOW PLAYING badge
function EqualizerBars() {
  return (
    <span className="eq-bars" aria-hidden="true">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`eq-bar eq-bar--${i}`} />
      ))}
    </span>
  )
}

// Floating particles overlay
function Particles({ count = 18 }) {
  return (
    <div className="particles-overlay" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${6 + Math.random() * 8}s`,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            opacity: 0.3 + Math.random() * 0.5,
          }}
        />
      ))}
    </div>
  )
}

export default function MediaShowcase({ onModeChange }) {
  const [mode, setMode] = useState('video')
  const [shuffledVideos, setShuffledVideos] = useState(() => shuffle(VIDEOS))
  const [shuffledImages, setShuffledImages] = useState(() => shuffle(IMAGES))
  const [videoIndex, setVideoIndex] = useState(0)
  const [imageIndex, setImageIndex] = useState(0)
  const [imageTransition, setImageTransition] = useState('enter')
  const [particles] = useState(() => 
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 8,
      size: 2 + Math.random() * 4,
      opacity: 0.3 + Math.random() * 0.45,
    }))
  )

  const videoRef = useRef(null)
  const bgAudioRef = useRef(null)
  const sessionTimerRef = useRef(null)
  const flyerTimerRef = useRef(null)
  const fadeTimerRef = useRef(null)

  // ── Audio fade utility ───────────────────────────────────────────
  const fadeAudio = useCallback((audioEl, targetVolume, duration = 800) => {
    if (!audioEl) return
    clearInterval(fadeTimerRef.current)
    const startVolume = audioEl.volume
    const steps = 20
    const stepTime = duration / steps
    const volumeStep = (targetVolume - startVolume) / steps
    let currentStep = 0

    fadeTimerRef.current = setInterval(() => {
      currentStep++
      if (audioEl) {
        audioEl.volume = Math.max(0, Math.min(1, startVolume + volumeStep * currentStep))
      }
      if (currentStep >= steps) {
        clearInterval(fadeTimerRef.current)
        if (audioEl) audioEl.volume = targetVolume
      }
    }, stepTime)
  }, [])

  // ── Mode transitions ─────────────────────────────────────────────
  const transitionToImageMode = useCallback(() => {
    setImageTransition('enter')
    setMode('image')
  }, [])

  const handleVideoEnded = useCallback(() => {
    transitionToImageMode()
  }, [transitionToImageMode])

  const handleVideoError = useCallback((e) => {
    const mediaError = e.target?.error
    // Code 1 is MEDIA_ERR_ABORTED. This happens normally when changing src, loading new streams, or unmounting.
    if (mediaError && mediaError.code === 1) {
      return
    }
    console.warn(
      'Video failed, skipping to next.',
      mediaError ? `Code: ${mediaError.code}, Message: ${mediaError.message}` : ''
    )
    setVideoIndex(prev => {
      const next = prev + 1
      if (next >= shuffledVideos.length) {
        setShuffledVideos(shuffle(VIDEOS))
        return 0
      }
      return next
    })
  }, [shuffledVideos.length])

  // ── Mode effect: audio ducking + timers ──────────────────────────
  useEffect(() => {
    onModeChange?.(mode)
    const bgAudio = bgAudioRef.current

    if (mode === 'video') {
      // ✅ FIX: Completely mute then pause background audio during video
      // This prevents hearing both video audio + background music simultaneously
      if (bgAudio) {
        fadeAudio(bgAudio, 0, 500)
        setTimeout(() => {
          if (bgAudio && !bgAudio.paused) bgAudio.pause()
        }, 600)
      }
    } else {
      // Resume background music during flyer mode
      if (bgAudio) {
        bgAudio.volume = 0
        bgAudio.play().catch(() => {})
        fadeAudio(bgAudio, 0.45, 1500)
      }

      // Image session timer — after 10 min go back to next video
      sessionTimerRef.current = setTimeout(() => {
        setMode('video')
        setVideoIndex(prev => {
          const next = prev + 1
          if (next >= shuffledVideos.length) {
            setShuffledVideos(shuffle(VIDEOS))
            return 0
          }
          return next
        })
      }, IMAGE_SESSION_DUR)

      // Flyer rotation timer
      flyerTimerRef.current = setInterval(() => {
        setImageIndex(prev => {
          const next = prev + 1
          if (next >= shuffledImages.length) {
            setShuffledImages(shuffle(IMAGES))
            return 0
          }
          return next
        })
      }, SINGLE_IMAGE_DUR)
    }

    return () => {
      clearTimeout(sessionTimerRef.current)
      clearInterval(flyerTimerRef.current)
    }
  }, [mode, shuffledVideos.length, shuffledImages.length, onModeChange, fadeAudio])

  // ── Video autoplay ───────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'video' || !videoRef.current) return
    const vid = videoRef.current
    vid.load()
    vid.muted = false
    vid.play().catch(() => {
      vid.muted = true
      vid.play().catch(() => {})
    })
  }, [videoIndex, mode])

  // ── Global interaction → unmute video + start bg audio ───────────
  useEffect(() => {
    const handleInteraction = () => {
      if (videoRef.current) videoRef.current.muted = false
      const bg = bgAudioRef.current
      if (bg && mode === 'image' && bg.paused) {
        bg.play().catch(() => {})
      }
    }
    window.addEventListener('click', handleInteraction, { once: true })
    window.addEventListener('keydown', handleInteraction, { once: true })
    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
    }
  }, [mode])

  const currentVideo = shuffledVideos[videoIndex]
  const currentImage = shuffledImages[imageIndex]

  return (
    <div className="showcase-root">
      {/* Background ambient music — only plays during flyer mode */}
      <audio
        ref={bgAudioRef}
        src="https://assets.mixkit.co/music/preview/mixkit-forest-lullaby-1109.mp3"
        loop
        preload="auto"
      />

      {/* ── Ambient background orbs (always visible) ── */}
      <div className="showcase-orbs" aria-hidden="true">
        <span className="orb orb--1" />
        <span className="orb orb--2" />
        <span className="orb orb--3" />
      </div>

      {/* ── VIDEO MODE ── */}
      {mode === 'video' && (
        <>
          {/* Dark backdrop with logo */}
          <div className="showcase-bg-placeholder">
            <img src="/assets/logo.png" alt="Imperialvilla" className="showcase-bg-logo" />
            <div className="showcase-bg-rings" aria-hidden="true">
              <span className="bg-ring bg-ring--1" />
              <span className="bg-ring bg-ring--2" />
              <span className="bg-ring bg-ring--3" />
            </div>
          </div>

          {/* Floating video modal */}
          {currentVideo && (
            <div className="showcase-video-wrapper">
              <div
                className="showcase-video-container"
                onClick={transitionToImageMode}
                title="Click to skip video"
                style={{ cursor: 'pointer' }}
              >
                <video
                  ref={videoRef}
                  key={currentVideo.src}
                  className="showcase-video"
                  src={currentVideo.src}
                  autoPlay
                  playsInline
                  onEnded={handleVideoEnded}
                  onError={handleVideoError}
                />
                <div className="showcase-overlay" />

                {/* NOW PLAYING badge with animated equalizer */}
                <div className="showcase-label">
                  <EqualizerBars />
                  <span>NOW PLAYING — {currentVideo.label}</span>
                </div>

                {/* Animated corner glow */}
                <div className="video-corner-glow" aria-hidden="true" />
              </div>
            </div>
          )}
        </>
      )}

      {/* ── IMAGE / FLYER MODE ── */}
      {mode === 'image' && currentImage && (
        <div
          className={`showcase-image-container showcase-image--${imageTransition}`}
          key={imageIndex}
        >
          <img
            src={currentImage.src}
            alt={currentImage.caption}
            className="showcase-img"
          />
          <div className="showcase-overlay" />

          {/* Floating particles */}
          <div className="particles-overlay" aria-hidden="true">
            {particles.map(p => (
              <span
                key={p.id}
                className="particle"
                style={{
                  left: `${p.left}%`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  opacity: p.opacity,
                }}
              />
            ))}
          </div>

          {/* Caption */}
          <div className="showcase-caption">
            <p className="showcase-caption__title">{currentImage.caption}</p>
            <p className="showcase-caption__sub">{currentImage.sub}</p>
          </div>

          {/* Progress bar */}
          <div className="showcase-progress">
            <div
              className="showcase-progress__bar"
              style={{ animationDuration: `${SINGLE_IMAGE_DUR}ms` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
