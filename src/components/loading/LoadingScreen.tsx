import { useEffect, useState, useRef } from 'react'
import { motion } from 'motion/react'
import { useProgress } from '@react-three/drei'
import { LoadingStarPentagon } from './LoadingStarPentagon'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useLoading } from '../../context/LoadingContext'
import { Sparkles } from 'lucide-react'

const MIN_INTRO_DURATION_DEFAULT = 900
const MIN_INTRO_DURATION_REDUCED = 250
const MAX_ASSET_WAIT_DEFAULT = 1400
const MAX_ASSET_WAIT_REDUCED = 450
const ANTICIPATION_DURATION = 140
const EXIT_TRANSITION_DURATION = 0.28

export function LoadingScreen() {
  const { startHeroReveal, completeLoading } = useLoading()
  const { progress: r3fProgress, active: r3fActive } = useProgress()
  const prefersReduced = useReducedMotion()

  const [displayProgress, setDisplayProgress] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const [is100Percent, setIs100Percent] = useState(false)

  const minDuration = prefersReduced ? MIN_INTRO_DURATION_REDUCED : MIN_INTRO_DURATION_DEFAULT
  const maxAssetWait = prefersReduced ? MAX_ASSET_WAIT_REDUCED : MAX_ASSET_WAIT_DEFAULT

  // Stable references to prevent effect restarting
  const minDurationRef = useRef(minDuration)
  const maxAssetWaitRef = useRef(maxAssetWait)
  const r3fRef = useRef({ progress: r3fProgress, active: r3fActive })

  useEffect(() => {
    minDurationRef.current = minDuration
    maxAssetWaitRef.current = maxAssetWait
  }, [maxAssetWait, minDuration])

  useEffect(() => {
    r3fRef.current = { progress: r3fProgress, active: r3fActive }
  }, [r3fProgress, r3fActive])

  const hasTriggeredExit = useRef(false)
  const isFinishedLoop = useRef(false)

  // Single persistent animation session on mount
  useEffect(() => {
    const startTime = performance.now()
    let fontLoaded = false
    let imageLoaded = false

    // Check Google Fonts readiness once
    if ('fonts' in document) {
      document.fonts.ready
        .then(() => {
          fontLoaded = true
        })
        .catch(() => {
          fontLoaded = true
        })
    } else {
      fontLoaded = true
    }

    // Preload critical SV5T logo asset once
    const img1 = new Image()
    img1.src = '/assets/sv5t-mark.png?v=2'
    img1.onload = img1.onerror = () => {
      imageLoaded = true
    }

    let rafId: number

    const updateProgressLoop = () => {
      if (isFinishedLoop.current) return

      const now = performance.now()
      const elapsed = now - startTime
      const currentMinDuration = minDurationRef.current
      const { progress: r3fValRaw, active: r3fActiveNow } = r3fRef.current

      // Calculate composite real progress: R3F (70%), Fonts (15%), Images (15%)
      const r3fVal = r3fActiveNow ? r3fValRaw : 100
      const fontVal = fontLoaded ? 100 : 30
      const imgVal = imageLoaded ? 100 : 40
      const compositeReal = r3fVal * 0.7 + fontVal * 0.15 + imgVal * 0.15

      // Check if real assets are fully ready
      const allAssetsReady = (!r3fActiveNow || r3fValRaw >= 100) && fontLoaded && imageLoaded

      // Time-based progression percentage (0 to 100 over minDuration)
      const timePercent = Math.min(100, (elapsed / currentMinDuration) * 100)

      // Target progress is bounded by both real asset loading and elapsed time
      let targetProgress = Math.min(compositeReal, timePercent)

      const canComplete = allAssetsReady && elapsed >= currentMinDuration
      const reachedAssetDeadline = elapsed >= maxAssetWaitRef.current

      if (!canComplete && targetProgress >= 99) {
        targetProgress = 99
      } else if (canComplete) {
        targetProgress = 100
      }

      setDisplayProgress((prev) => {
        if (prev >= 100) return 100

        const diff = targetProgress - prev
        const step = Math.max(0.6, diff * 0.15)
        // Monotonic non-decreasing guarantee: never drop below prev
        const next = Math.max(prev, Math.min(targetProgress, prev + step))

        if (canComplete || reachedAssetDeadline) {
          isFinishedLoop.current = true
          return 100
        }

        return next
      })

      if (!isFinishedLoop.current) {
        rafId = requestAnimationFrame(updateProgressLoop)
      }
    }

    rafId = requestAnimationFrame(updateProgressLoop)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [])

  // Handle 100% Anticipation -> Start Hero Reveal -> Exit Transition -> completeLoading
  useEffect(() => {
    if (displayProgress >= 100 && !hasTriggeredExit.current) {
      hasTriggeredExit.current = true
      setIs100Percent(true)

      let fallbackTimer: ReturnType<typeof setTimeout> | number | undefined

      // Anticipation phase: Stay at 100% for 260ms (logo/star charge)
      const anticipationTimer = setTimeout(() => {
        setIsExiting(true)
        // Notify Hero and Navbar to begin their staged reveal immediately!
        startHeroReveal()

        // Fallback timer to ensure loader is unmounted cleanly
        fallbackTimer = setTimeout(() => {
          completeLoading()
        }, Math.round(EXIT_TRANSITION_DURATION * 1000) + 80)
      }, ANTICIPATION_DURATION)

      return () => {
        clearTimeout(anticipationTimer)
        if (fallbackTimer) clearTimeout(fallbackTimer)
      }
    }
  }, [displayProgress, startHeroReveal, completeLoading])

  // Map progress (0 - 100) to 5 active criteria points
  const activeCount = is100Percent ? 5 : Math.min(5, Math.floor((displayProgress / 100) * 5.15))

  return (
    <motion.div
      className="loading-screen fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0b234d] select-none overflow-hidden"
      aria-label="Đang tải trải nghiệm 5SS UET"
      aria-busy={!isExiting}
      initial={{ opacity: 1 }}
      animate={
        isExiting
          ? {
              opacity: 0,
              scale: prefersReduced ? 1 : 1.05,
              filter: prefersReduced ? 'blur(0px)' : 'blur(16px)',
              pointerEvents: 'none' as const,
            }
          : {
              opacity: 1,
              scale: 1,
              filter: 'blur(0px)',
            }
      }
      transition={{
        duration: prefersReduced ? 0.25 : EXIT_TRANSITION_DURATION,
        ease: [0.16, 1, 0.3, 1],
      }}
      onAnimationComplete={() => {
        if (isExiting) {
          completeLoading()
        }
      }}
    >
      {/* Bright Celestial Cosmic Dust & Ocean Gold Nebula Atmosphere */}
      <div className="absolute inset-0 pointer-events-none opacity-60 bg-[radial-gradient(circle_at_50%_45%,rgba(94,175,232,0.45)_0%,rgba(14,46,94,0.95)_75%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_65%_45%_at_50%_40%,rgba(117,207,229,0.22)_0%,transparent_65%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-35 bg-[radial-gradient(circle_at_80%_20%,rgba(255,216,106,0.28)_0%,transparent_50%)]" />

      {/* Brand Eyebrow */}
      <motion.div
        className="relative z-10 flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-[rgba(255,216,106,0.5)] bg-[rgba(24,69,133,0.7)] backdrop-blur-md shadow-[0_8px_24px_rgba(7,24,56,0.35)]"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Sparkles size={13} className="text-[#ffd467] animate-pulse" />
        <span className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-[#ffffff]">
          5SS UET · Hệ Sinh Thái 5 Tốt
        </span>
      </motion.div>

      {/* 5-Node Constellation Star System */}
      <div className="relative z-10">
        <LoadingStarPentagon activeCount={activeCount} isComplete={is100Percent} />
      </div>

      {/* Percentage & Loading Status Line */}
      <div className="relative z-10 flex flex-col items-center mt-6 gap-2">
        <div className="flex items-baseline gap-1">
          <span className="font-heading font-extrabold text-4xl tracking-tight text-[#ffffff] tabular-nums drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
            {Math.round(displayProgress)}
          </span>
          <span className="text-sm font-extrabold text-[#ffd467]">%</span>
        </div>

        {/* Micro Progress Track Bar with Fresh Blue-Cyan-Gold Gradient */}
        <div className="w-52 h-[3px] rounded-full bg-[rgba(159,215,245,0.2)] overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-[#2f7bd8] via-[#75cfe5] to-[#ffd467]"
            style={{ width: `${displayProgress}%` }}
            transition={{ duration: 0.08 }}
          />
        </div>

        <span
          className="text-[11px] font-bold tracking-wider text-[#b6def5] uppercase mt-1"
          aria-live="polite"
          aria-atomic="true"
        >
          {displayProgress < 25
            ? 'Khởi tạo không gian số...'
            : displayProgress < 50
            ? 'Đồng bộ 5 chặng rèn luyện...'
            : displayProgress < 75
            ? 'Liên kết tiêu chí phát triển...'
            : displayProgress < 100
            ? 'Hội tụ năng lượng sinh viên...'
            : 'Sẵn sàng khám phá!'}
        </span>
      </div>

      {/* Academic Institution Subtitle */}
      <motion.div
        className="absolute bottom-7 text-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-[11px] font-semibold text-[#86b8db] tracking-widest uppercase">
          Trường Đại học Công nghệ · ĐHQGHN
        </p>
      </motion.div>
    </motion.div>
  )
}
