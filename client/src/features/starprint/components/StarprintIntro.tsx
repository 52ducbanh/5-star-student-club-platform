import { motion } from 'motion/react'
import { Sparkles } from 'lucide-react'

interface Props { onStart: () => void }

export function StarprintIntro({ onStart }: Props) {
  return (
    <div className="starprint-intro">
      <motion.div
        className="starprint-intro__content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="starprint-intro__icon">
          <Sparkles size={48} />
        </div>
        <h1 className="starprint-intro__title">BUILD YOUR STARPRINT</h1>
        <p className="starprint-intro__sub">Khám phá dấu ấn sinh viên độc đáo của bạn qua 5 thử thách thú vị.</p>
        <ul className="starprint-intro__steps">
          <li>⚡ SOLVE — Tư duy Logic</li>
          <li>💫 SENSE — Đồng cảm & Đạo đức</li>
          <li>🏃 SPRINT — Năng lượng & Thể lực</li>
          <li>🔗 SUPPORT — Kết nối cộng đồng</li>
          <li>🌐 SYNC — Hội nhập & Thích nghi</li>
        </ul>
        <p className="starprint-intro__time">⏱ Khoảng 3 phút · Chỉ cần điện thoại</p>
        <button className="btn btn--primary starprint-intro__cta" onClick={onStart}>
          Bắt đầu hành trình ✨
        </button>
      </motion.div>
    </div>
  )
}
