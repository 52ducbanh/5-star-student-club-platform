import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useReducedMotion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useStarprintStore } from '../store/useStarprintStore'
import { StarPrintSVG } from './StarPrintSVG'

export function FinalReveal() {
  const { starprint, nickname } = useStarprintStore()
  const reduceMotion = useReducedMotion()
  const navigate = useNavigate()
  const [revealedWings, setRevealedWings] = useState(reduceMotion ? 5 : 0)
  const [showMeta, setShowMeta] = useState(Boolean(reduceMotion))

  useEffect(() => {
    if (reduceMotion) return
    const timers: Array<ReturnType<typeof setTimeout>> = []
    for (let i = 1; i <= 5; i++) {
      timers.push(
        setTimeout(() => {
          setRevealedWings(i)
        }, i * 350)
      )
    }
    timers.push(
      setTimeout(() => {
        setShowMeta(true)
      }, 2100)
    )
    return () => timers.forEach(clearTimeout)
  }, [reduceMotion])

  if (!starprint) {
    return <div className="game-step"><p>Đang tải kết quả...</p></div>
  }

  const transition = reduceMotion ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }

  return (
    <div className="final-reveal">
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={transition}
        className="final-reveal__star-container"
      >
        <StarPrintSVG
          palette={starprint.palette}
          effect={starprint.effect}
          photoUrl={starprint.photoUrl}
          completedWings={revealedWings}
          size={300}
        />
      </motion.div>

      {showMeta && (
        <motion.div
          className="final-reveal__info"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
        >
          <div className="final-reveal__badge">✨ STARPRINT CỦA BẠN ĐÃ TỎA SÁNG</div>
          <h2>{nickname}</h2>
          <h3>{starprint.type.name}</h3>
          <p>{starprint.type.description}</p>
          <button
            className="btn btn--primary final-reveal__btn"
            onClick={() => navigate(`/starprint/result/${starprint.id}`)}
          >
            Xem kết quả chi tiết & Chia sẻ →
          </button>
        </motion.div>
      )}
    </div>
  )
}
