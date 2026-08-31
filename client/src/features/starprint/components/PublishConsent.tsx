import { useState } from 'react'
import { starprintApi } from '../services/starprintApi'

interface Props {
  starprintId: string
}

export function PublishConsent({ starprintId }: Props) {
  const [consentName, setConsentName] = useState(false)
  const [consentPhoto, setConsentPhoto] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const publish = async () => {
    setPublishing(true)
    setError(null)
    try {
      await starprintApi.publishStarprint(starprintId, { consentName, consentPhoto })
      setPublished(true)
    } catch {
      setError('Không thể chia sẻ. Thử lại?')
    } finally {
      setPublishing(false)
    }
  }

  if (published) {
    return <div className="publish-success">✨ Ngôi sao của bạn đã xuất hiện trên 5SS Sky!</div>
  }

  return (
    <div className="publish-consent">
      <h3>Chia sẻ lên 5SS Sky</h3>
      <label className="consent-checkbox">
        <input type="checkbox" checked={consentName} onChange={(e) => setConsentName(e.target.checked)} />
        <span>Hiển thị tên/biệt danh của tôi</span>
      </label>
      <label className="consent-checkbox">
        <input type="checkbox" checked={consentPhoto} onChange={(e) => setConsentPhoto(e.target.checked)} />
        <span>Hiển thị ảnh của tôi</span>
      </label>
      {error && <p className="field-error">{error}</p>}
      <button className="btn btn--primary" disabled={publishing} onClick={publish}>
        {publishing ? 'Đang chia sẻ...' : 'Chia sẻ lên Sky ✨'}
      </button>
    </div>
  )
}
