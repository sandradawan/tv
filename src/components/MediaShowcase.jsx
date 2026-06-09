import { useState, useEffect, useRef } from 'react'
import './MediaShowcase.css'

const VIDEOS = [
  { src: '/assets/video.mp4', label: 'Local Video Preview' },
  { src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', label: 'Imperialvilla — Highlights' },
  { src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', label: 'Our Premium Properties' },
  { src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', label: 'Excellence in Every Build' },
]

const IMAGES = [
  { src: '/assets/flyer4.png', caption: 'Welcome to Imperialvilla', sub: 'Excellence in Every Build' },
  { src: '/assets/flyer1.png', caption: 'Find Your Dream Home', sub: 'Premium Properties Across Nigeria' },
  { src: '/assets/flyer2.png', caption: 'Invest in Real Estate Today', sub: 'Secure Your Future With Smart Property Investments' },
  { src: '/assets/flyer3.png', caption: 'Our Services', sub: 'Sales · Management · Acquisition · Leasing' },
]

// Fetch configurable session durations from environment (with fallbacks)
const IMAGE_SESSION_DUR = Number(import.meta.env.VITE_IMAGE_SESSION_DUR) || 600000;      // 10 minutes
const SINGLE_IMAGE_DUR  = Number(import.meta.env.VITE_SINGLE_IMAGE_DUR)  || 8000;       // 8 seconds

// Helper to shuffle array
function shuffle(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function MediaShowcase({ onModeChange }) {
  const [mode, setMode] = useState('video') // 'video' or 'image'

  // Playlists (Shuffled on initialization)
  const [shuffledVideos, setShuffledVideos] = useState(() => shuffle(VIDEOS))
  const [shuffledImages, setShuffledImages] = useState(() => shuffle(IMAGES))

  const [videoIndex, setVideoIndex] = useState(0)
  const [imageIndex, setImageIndex] = useState(0)
  const [imageTransition, setImageTransition] = useState('enter')

  const videoRef = useRef(null)
  const bgAudioRef = useRef(null)
  const sessionTimerRef = useRef(null)
  const flyerTimerRef = useRef(null)

  // Smooth audio fading utility
  const fadeAudio = (audioEl, targetVolume, duration = 800) => {
    if (!audioEl) return
    const startVolume = audioEl.volume
    const steps = 16
    const stepTime = duration / steps
    const volumeStep = (targetVolume - startVolume) / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      if (audioEl) {
        audioEl.volume = Math.max(0, Math.min(1, startVolume + volumeStep * currentStep))
      }
      if (currentStep >= steps) {
        clearInterval(timer)
        if (audioEl) audioEl.volume = targetVolume
      }
    }, stepTime)
  }

  // Transition from video to image mode
  const transitionToImageMode = () => {
    setImageTransition('enter')
    setMode('image')
  }

  // Handle Video ending (natural completion)
  const handleVideoEnded = () => {
    transitionToImageMode()
  }

  // Handle Video load/play error (fallback to next video in queue if file is missing)
  const handleVideoError = (e) => {
    console.warn("Video failed to load, skipping to next:", currentVideo?.src)
    setVideoIndex((prev) => {
      const next = prev + 1
      if (next >= shuffledVideos.length) {
        setShuffledVideos(shuffle(VIDEOS))
        return 0
      }
      return next
    })
  }

  // Skip video helper for testing
  const handleSkipVideo = () => {
    transitionToImageMode()
  }

  // Session coordination and intervals
  useEffect(() => {
    // Notify parent App component of current mode to handle background blur
    onModeChange?.(mode)

    const bgAudio = bgAudioRef.current

    if (mode === 'video') {
      // Duck background music volume during video session
      if (bgAudio) fadeAudio(bgAudio, 0.08)

      // In video mode, we do NOT run a session timer.
      // The video plays completely from start to finish.
    } else {
      // Restore full background music volume during flyer loop
      if (bgAudio) {
        fadeAudio(bgAudio, 0.4)
        bgAudio.play().catch(() => {})
      }

      // ── Image Session Timer ──
      sessionTimerRef.current = setTimeout(() => {
        setMode('video')
        // Advance to the next video in the queue
        setVideoIndex((prev) => {
          const next = prev + 1
          if (next >= shuffledVideos.length) {
            setShuffledVideos(shuffle(VIDEOS))
            return 0
          }
          return next
        })
      }, IMAGE_SESSION_DUR)

      // ── Flyer Rotation Timer ──
      flyerTimerRef.current = setInterval(() => {
        setImageIndex((prev) => {
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
  }, [mode, shuffledVideos.length, shuffledImages.length, onModeChange])

  // Autoplay handler with audio-blocked fallback and user interaction listener
  useEffect(() => {
    if (mode !== 'video' || !videoRef.current) return

    videoRef.current.load()
    
    // Attempt unmuted play first
    videoRef.current.muted = false
    const playPromise = videoRef.current.play()

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay with audio was blocked: fallback to muted autoplay so it plays on launch
        if (videoRef.current) {
          videoRef.current.muted = true
          videoRef.current.play().catch(() => {})
        }
      })
    }
  }, [videoIndex, mode])

  // Global listener to unmute video and play background audio on click/keypress
  useEffect(() => {
    const handleInteraction = () => {
      if (videoRef.current) {
        videoRef.current.muted = false
      }
      if (bgAudioRef.current) {
        bgAudioRef.current.play().catch(() => {})
      }
    }

    window.addEventListener('click', handleInteraction)
    window.addEventListener('keydown', handleInteraction)

    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
    }
  }, [mode])

  const currentVideo = shuffledVideos[videoIndex]
  const currentImage = shuffledImages[imageIndex]

  return (
    <div className="showcase-root">
      {/* Continuous smooth background music */}
      <audio
        ref={bgAudioRef}
        src="https://assets.mixkit.co/music/preview/mixkit-forest-lullaby-1109.mp3"
        loop
        preload="auto"
      />

      {/* Placeholder backdrop visible behind the floating video modal */}
      {mode === 'video' && (
        <div className="showcase-bg-placeholder">
          <img src="/assets/logo.png" alt="Imperialvilla" className="showcase-bg-logo" />
        </div>
      )}

      {/* ── Video Player Mode (Floating Modal) ── */}
      {mode === 'video' && currentVideo && (
        <div className="showcase-video-wrapper">
          <div 
            className="showcase-video-container" 
            onClick={handleSkipVideo} 
            style={{ cursor: 'pointer' }} 
            title="Click to skip video session"
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
            {/* Overlay */}
            <div className="showcase-overlay" />
            {/* Floating Card Label */}
            <div className="showcase-label">
              <span className="showcase-label__dot" />
              Playing: {currentVideo.label} (Click to Skip)
            </div>
          </div>
        </div>
      )}

      {/* ── Flyer Popup Mode (Book Open transition) ── */}
      {mode === 'image' && currentImage && (
        <div 
          className={`showcase-image-container showcase-image--${imageTransition}`}
          key={imageIndex} // Changing key triggers the 3D entry animation for each slide
        >
          <img
            src={currentImage.src}
            alt={currentImage.caption}
            className="showcase-img"
          />
          <div className="showcase-overlay" />
          
          {/* Caption */}
          <div className="showcase-caption">
            <p className="showcase-caption__title">{currentImage.caption}</p>
            <p className="showcase-caption__sub">{currentImage.sub}</p>
          </div>

          {/* Progress Bar */}
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
