import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useStarprintStore } from '../store/useStarprintStore'
import { starprintApi } from '../services/starprintApi'

export function GeneratingStep() {
  const reduceMotion = useReducedMotion()
  const { sessionId, selectedColor, photoPreviewUrl, setStarprint, setStep } = useStarprintStore()
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const called = useRef(false)

  const generate = useCallback(async () => {
    if (!sessionId || !selectedColor) {
      setStep('COLOR_PICKER')
      return
    }
    setError(null)
    setGenerating(true)
    try {
      const data = await starprintApi.generateStarprint({ sessionId, baseColor: selectedColor })
      const finalData = {
        ...data,
        photoUrl: data.photoUrl || photoPreviewUrl || null,
      }
      setStarprint(finalData)
      setStep('FINAL_REVEAL')
    } catch {
      setError('Không thể tạo STARPRINT do lỗi kết nối hoặc phiên hết hạn.')
    } finally {
      setGenerating(false)
    }
  }, [sessionId, selectedColor, setStarprint, setStep])

  useEffect(() => {
    if (called.current) return
    called.current = true
    void generate()
  }, [generate])

  return (
    <div className="game-step generating-step">
      {generating && (
        <motion.div
          animate={reduceMotion ? {} : { rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          className="generating-step__spinner"
        >
          ⭐
        </motion.div>
      )}
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem' }}>
        {generating ? 'Đang tổng hợp STARPRINT...' : error ? 'Tạo STARPRINT không thành công' : 'Đang xử lý...'}
      </h2>
      {generating && (
        <p style={{ color: '#b6def5', fontSize: '15px' }}>
          Hệ thống đang phân tích hành trình và tính cách vũ trụ của bạn
        </p>
      )}
      {error && (
        <div className="game-error-box">
          <p className="field-error" role="alert">{error}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
            <button className="btn btn--primary" onClick={generate}>
              Thử lại 🔄
            </button>
            <button className="btn btn--outline" onClick={() => setStep('COLOR_PICKER')}>
              Chọn lại màu 🎨
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
