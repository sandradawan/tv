import { useState, useEffect, useRef, useCallback } from 'react'
import './MediaShowcase.css'

// ── Media Lists ──────────────────────────────────────────
const VIDEOS = [
  { src: '/assets/video.mp4',  label: 'Imperialvilla Showcase' },
  { src: '/assets/video2.mp4', label: 'Imperialvilla Highlights' },
]

const IMAGES = [
  // Branded flyers
  { src: '/assets/flyer4.png',  caption: 'Welcome to Imperialvilla',        sub: 'Excellence in Every Build' },
  { src: '/assets/flyer1.png',  caption: 'Find Your Dream Home',             sub: 'Premium Properties Across Nigeria' },
  { src: '/assets/flyer2.png',  caption: 'Invest in Real Estate Today',      sub: 'Secure Your Future With Smart Investments' },
  { src: '/assets/flyer3.png',  caption: 'Our Services',                     sub: 'Sales · Management · Acquisition · Leasing' },
  // Photo gallery
  { src: '/assets/gombe.jpeg',  caption: 'Gombe State',                      sub: 'Imperialvilla Developments' },
  { src: '/assets/staff.jpeg',  caption: 'Our Team',                         sub: 'Dedicated Professionals Serving You' },
  { src: '/assets/staff2.jpeg', caption: 'Meet the Team',                    sub: 'Building Relationships, Creating Value' },
  { src: '/assets/staff3.jpeg', caption: 'Imperialvilla Staff',              sub: 'Excellence in Every Interaction' },
  { src: '/assets/staff4.jpeg', caption: 'Our People',                       sub: 'The Heart of Imperialvilla' },
  { src: '/assets/staff5.jpeg', caption: 'Professional Team',                sub: 'Your Success is Our Priority' },
  { src: '/assets/staff6.jpeg', caption: 'Imperialvilla Professionals',      sub: 'Committed to Your Real Estate Journey' },
  { src: '/assets/staff7.jpeg', caption: 'Award-Winning Service',            sub: 'Industry Leaders Since 2015' },
  { src: '/assets/staff8.jpeg', caption: 'Expert Advisors',                  sub: 'Trusted Guidance for Every Decision' },
  { src: '/assets/staff9.jpeg', caption: 'Join Our Growing Family',          sub: 'Premier Real Estate in Nigeria' },
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

// ── Animated equalizer bars (NOW PLAYING badge) ──────────
function EqualizerBars() {
  return (
    <span className="eq-bars" aria-hidden="true">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`eq-bar eq-bar--${i}`} />
      ))}
    </span>
  )
}

// ── Main Component ───────────────────────────────────────
export default function MediaShowcase() {
  const [mode,           setMode]           = useState('video')
  const [shuffledVideos, setShuffledVideos] = useState(() => shuffle(VIDEOS))
  const [shuffledImages, setShuffledImages] = useState(() => shuffle(IMAGES))
  const [videoIndex,     setVideoIndex]     = useState(0)
  const [imageIndex,     setImageIndex]     = useState(0)
  const [imageTransition,setImageTransition]= useState('enter')

  // Stable particle positions (avoid re-generating on every render)
  const [particles] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left:     Math.random() * 100,
      delay:    Math.random() * 8,
      duration: 6 + Math.random() * 8,
      size:     2 + Math.random() * 4,
      opacity:  0.3 + Math.random() * 0.45,
    }))
  )

  // ── Master audio mute state ──────────────────────────────
  // Starts muted — browsers block autoplay with sound by default.
  // isMutedRef keeps a live copy so effects always read the latest value
  // without needing to be listed as a dependency (avoids restart loops).
  const [isMuted, setIsMuted] = useState(true)
  const isMutedRef = useRef(true)
  useEffect(() => { isMutedRef.current = isMuted }, [isMuted])

  const videoRef      = useRef(null)
  const bgAudioRef    = useRef(null)
  const sessionTimer  = useRef(null)
  const flyerTimer    = useRef(null)
  const fadeTimer     = useRef(null)
  // Track whether bg music should currently be playing
  const bgShouldPlay  = useRef(false)

  // ── Audio fade helper ────────────────────────────────────
  const fadeAudio = useCallback((el, target, ms = 800) => {
    if (!el) return
    clearInterval(fadeTimer.current)
    const start = el.volume
    const steps = 20
    const step  = (target - start) / steps
    let   n     = 0
    fadeTimer.current = setInterval(() => {
      n++
      el.volume = Math.max(0, Math.min(1, start + step * n))
      if (n >= steps) {
        clearInterval(fadeTimer.current)
        el.volume = target
      }
    }, ms / steps)
  }, [])

  // ── Start background music ───────────────────────────────
  // Always start playing (muted or unmuted — browser allows muted autoplay).
  // Volume will be set to 0 if muted, 0.5 if unmuted.
  const startBgMusic = useCallback(() => {
    const bg = bgAudioRef.current
    if (!bg) return
    bgShouldPlay.current = true
    bg.muted  = false
    bg.volume = 0
    bg.play()
      .then(() => {
        // Only fade to audible volume if user has unmuted
        if (!isMutedRef.current) {
          fadeAudio(bg, 0.5, 1800)
        }
      })
      .catch(() => {
        // Autoplay blocked — stays silent until user interaction
      })
  }, [fadeAudio])

  // ── Stop background music ────────────────────────────────
  const stopBgMusic = useCallback(() => {
    const bg = bgAudioRef.current
    bgShouldPlay.current = false
    if (!bg) return
    fadeAudio(bg, 0, 500)
    setTimeout(() => {
      if (bg && !bg.paused) bg.pause()
      bg.currentTime = 0  // reset position so it starts fresh next time
    }, 600)
  }, [fadeAudio])

  // ── Mode: switch to image slideshow ─────────────────────
  const goToImage = useCallback(() => {
    setImageTransition('enter')
    setMode('image')
  }, [])

  // ── Mode: switch to next video ───────────────────────────
  const goToNextVideo = useCallback(() => {
    setMode('video')
    setVideoIndex(prev => {
      const next = prev + 1
      if (next >= shuffledVideos.length) { setShuffledVideos(shuffle(VIDEOS)); return 0 }
      return next
    })
  }, [shuffledVideos.length])

  // ── Video event handlers ─────────────────────────────────
  const handleVideoEnded = useCallback(() => goToImage(), [goToImage])

  const handleVideoError = useCallback((e) => {
    const err = e.target?.error
    if (err?.code === 1) return  // MEDIA_ERR_ABORTED — normal during src switches
    console.warn('Video error, skipping.', err ? `Code ${err.code}` : '')
    setVideoIndex(prev => {
      const next = prev + 1
      if (next >= shuffledVideos.length) { setShuffledVideos(shuffle(VIDEOS)); return 0 }
      return next
    })
  }, [shuffledVideos.length])

  // ── Effect: mode changed → manage audio + timers ─────────
  useEffect(() => {
    if (mode === 'video') {
      // Stop background music immediately
      stopBgMusic()
      clearTimeout(sessionTimer.current)
      clearInterval(flyerTimer.current)
    } else {
      // Start background music for image slideshow
      startBgMusic()

      // After session timeout, cycle back to next video
      sessionTimer.current = setTimeout(goToNextVideo, IMAGE_SESSION_DUR)

      // Rotate flyers
      flyerTimer.current = setInterval(() => {
        setImageIndex(prev => {
          const next = prev + 1
          if (next >= shuffledImages.length) { setShuffledImages(shuffle(IMAGES)); return 0 }
          return next
        })
      }, SINGLE_IMAGE_DUR)
    }

    return () => {
      clearTimeout(sessionTimer.current)
      clearInterval(flyerTimer.current)
    }
  }, [mode, shuffledImages.length, shuffledVideos.length, startBgMusic, stopBgMusic, goToNextVideo])

  // ── Effect: play video whenever index or mode changes ────
  useEffect(() => {
    if (mode !== 'video' || !videoRef.current) return
    const vid = videoRef.current
    vid.load()

    if (isMutedRef.current) {
      // Start muted, browser allows this
      vid.muted = true
      vid.play().catch(() => {})
    } else {
      // User has interacted → try unmuted, fallback to muted
      vid.muted = false
      vid.play().catch(() => {
        vid.muted = true
        vid.play().catch(() => {})
      })
    }
  }, [videoIndex, mode])

  // ── Effect: sync master mute to live audio/video elements ─
  useEffect(() => {
    const vid = videoRef.current
    const bg  = bgAudioRef.current

    if (isMuted) {
      // Mute: silence video, fade bg music to 0 (but keep playing so it resumes instantly)
      if (vid) vid.muted = true
      if (bg && bgShouldPlay.current) fadeAudio(bg, 0, 400)
    } else {
      // Unmute: restore video audio
      if (vid) vid.muted = false
      // If in image mode: fade bg music back in
      if (mode === 'image') {
        if (bg) {
          if (bg.paused) {
            bg.volume = 0
            bg.play().then(() => fadeAudio(bg, 0.5, 1200)).catch(() => {})
          } else {
            fadeAudio(bg, 0.5, 1200)
          }
          bgShouldPlay.current = true
        }
      }
    }
  }, [isMuted, mode, fadeAudio])

  // ── Effect: first user interaction → auto-unmute ─────────
  useEffect(() => {
    const unlock = () => setIsMuted(false)
    window.addEventListener('click',   unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('click',   unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  // ── Render ───────────────────────────────────────────────
  const currentVideo = shuffledVideos[videoIndex]
  const currentImage = shuffledImages[imageIndex]

  return (
    <div className="showcase-root">
      {/* Background ambient music — plays only during flyer mode */}
      <audio
        ref={bgAudioRef}
        src="/assets/background.mp3"
        loop
        preload="auto"
      />

      {/* ── Sound Toggle Button ── */}
      <button
        className={`sound-toggle ${isMuted ? 'sound-toggle--muted' : ''}`}
        onClick={(e) => { e.stopPropagation(); setIsMuted(m => !m) }}
        title={isMuted ? 'Enable Sound' : 'Mute'}
        aria-label={isMuted ? 'Enable sound' : 'Mute sound'}
      >
        {isMuted ? (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sound-icon">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
            <span className="sound-toggle-text">Enable Sound</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sound-icon">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            <span className="sound-toggle-text">Mute</span>
          </>
        )}
      </button>

      {/* ── Ambient orbs ── */}
      <div className="showcase-orbs" aria-hidden="true">
        <span className="orb orb--1" />
        <span className="orb orb--2" />
        <span className="orb orb--3" />
      </div>

      {/* ── VIDEO MODE ── */}
      {mode === 'video' && (
        <>
          {/* Dark backdrop */}
          <div className="showcase-bg-placeholder">
            <img src="/assets/logo.png" alt="Imperialvilla" className="showcase-bg-logo" />
            <div className="showcase-bg-rings" aria-hidden="true">
              <span className="bg-ring bg-ring--1" />
              <span className="bg-ring bg-ring--2" />
              <span className="bg-ring bg-ring--3" />
            </div>
          </div>

          {/* Floating video player */}
          {currentVideo && (
            <div className="showcase-video-wrapper">
              <div
                className="showcase-video-container"
                onClick={goToImage}
                title="Click to skip to flyers"
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

                {/* NOW PLAYING badge */}
                <div className="showcase-label">
                  <EqualizerBars />
                  <span>Now Playing — {currentVideo.label}</span>
                </div>

                {/* Corner glow accent */}
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
                  left:              `${p.left}%`,
                  animationDelay:    `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                  width:             `${p.size}px`,
                  height:            `${p.size}px`,
                  opacity:           p.opacity,
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
