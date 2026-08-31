import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Sparkles, ArrowRight, Brain, Compass, Zap, Share2, Globe } from 'lucide-react'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'

const GAMES = [
  {
    id: 'solve',
    order: '01',
    name: 'SOLVE',
    title: 'Tư Duy Logic',
    criterion: 'Học tập tốt',
    icon: Brain,
    color: '#6cd5f7',
    desc: 'Giải nhanh chuỗi câu đố quy luật toán học & logic trong 20 giây.',
  },
  {
    id: 'sense',
    order: '02',
    name: 'SENSE',
    title: 'Định Hướng Đạo Đức',
    criterion: 'Đạo đức tốt',
    icon: Compass,
    color: '#ff5c5c',
    desc: 'Phản xạ ứng xử trước các tình huống đồng đội và đạo đức thực tế.',
  },
  {
    id: 'sprint',
    order: '03',
    name: 'SPRINT',
    title: 'Bứt Tốc Thể Lực',
    criterion: 'Thể lực tốt',
    icon: Zap,
    color: '#ffd467',
    desc: 'Game 2D Runner 20s: Nhảy vượt chướng ngại vật & thu thập sao năng lượng.',
  },
  {
    id: 'support',
    order: '04',
    name: 'SUPPORT',
    title: 'Mạng Lưới Tình Nguyện',
    criterion: 'Tình nguyện tốt',
    icon: Share2,
    color: '#5fe3a1',
    desc: 'Xoay các ô nối mạch lưới 4x4 để truyền năng lượng từ nguồn tới đích.',
  },
  {
    id: 'sync',
    order: '05',
    name: 'SYNC',
    title: 'Hòa Nhịp Hội Nhập',
    criterion: 'Hội nhập tốt',
    icon: Globe,
    color: '#b794f6',
    desc: 'Lật tìm các cặp biểu tượng tương ứng để đo lường độ nhạy bén toàn cầu.',
  },
]

export function StarprintShowcaseSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="starprint-showcase" id="starprint-showcase" aria-labelledby="starprint-showcase-title">
      <div className="container--wide">
        <div className="starprint-showcase__header">
          <div className="section-badge">
            <Sparkles size={13} aria-hidden="true" />
            <span>BUILD YOUR STAR · TRẢI NGHIỆM ĐẶC QUYỀN</span>
          </div>
          <h2 id="starprint-showcase-title" className="section-title">
            Tạo Dấu Ấn <span className="text-gradient">STARPRINT</span> Của Riêng Bạn
          </h2>
          <p className="section-subtitle">
            Khám phá bản thân qua 5 mini-games tương ứng 5 tiêu chí Sinh viên 5 Tốt.
            Hệ thống sẽ phân tích và tạo nên ngôi sao 5 cánh độc nhất của bạn trên 5SS Sky.
          </p>
        </div>

        <div className="starprint-showcase__grid">
          {GAMES.map((game, index) => {
            const Icon = game.icon
            return (
              <motion.div
                key={game.id}
                className="showcase-game-card"
                style={{ '--card-accent': game.color } as React.CSSProperties}
                initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
                whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <div className="showcase-game-card__top">
                  <span className="showcase-game-card__order">{game.order}</span>
                  <span className="showcase-game-card__criterion" style={{ color: game.color }}>
                    {game.criterion}
                  </span>
                </div>
                <div className="showcase-game-card__icon" style={{ background: `${game.color}20`, color: game.color }}>
                  <Icon size={24} aria-hidden="true" />
                </div>
                <h3 className="showcase-game-card__title">
                  <strong>{game.name}</strong> · {game.title}
                </h3>
                <p className="showcase-game-card__desc">{game.desc}</p>
              </motion.div>
            )
          })}
        </div>

        <div className="starprint-showcase__cta-wrap">
          <Link to="/starprint" className="btn btn--primary hero-primary-cta">
            Bắt đầu tạo STARPRINT ngay ✨
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link to="/sky" className="btn btn--outline">
            Xem bầu trời 5SS Sky 🌌
          </Link>
        </div>
      </div>
    </section>
  )
}
