import { ArrowLeft, Orbit } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main id="main-content" className="not-found-page" tabIndex={-1}>
      <div className="not-found-page__orbit" aria-hidden="true"><Orbit /></div>
      <p className="eyebrow">Tọa độ ngoài bản đồ</p>
      <h1>4<span>0</span>4</h1>
      <h2>Chặng này chưa tồn tại.</h2>
      <p>Đường dẫn có thể đã thay đổi hoặc bạn vừa đi hơi xa khỏi quỹ đạo 5SS Galaxy.</p>
      <Link className="btn btn--primary" to="/"><ArrowLeft size={17} aria-hidden="true" /> Trở về trang chủ</Link>
    </main>
  )
}
