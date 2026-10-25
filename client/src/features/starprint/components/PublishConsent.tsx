import { useState } from 'react'
import { starprintApi } from '../services/starprintApi'

interface Props {
  starprintId: string
  sessionId?: string
  initialMediaPermission?: boolean
}

export function PublishConsent({
  starprintId,
  sessionId,
  initialMediaPermission = true,
}: Props) {
  const [mediaPermission, setMediaPermission] = useState(
    initialMediaPermission,
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const savePreferences = async () => {
    if (!sessionId) {
      setError('Không tìm thấy phiên người dùng hợp lệ để lưu tùy chọn.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await starprintApi.publishStarprint(starprintId, {
        sessionId,
        // Portraits stay on this device; the API always returns null for photos.
        consentName: true,
        consentPhoto: true,
        physicalCardRequested: false,
        mediaPermission,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Không thể cập nhật tùy chọn. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="publish-consent">
      <div className="publish-consent__header">
        <span className="publish-consent__icon">✨</span>
        <strong>STARPRINT đã tự động tỏa sáng trên 5SS Sky của sự kiện</strong>
      </div>

      <div className="publish-consent__options">
        <p>Ảnh chân dung chỉ được giữ tạm trên thiết bị của bạn. Hãy tải PNG để lưu và chia sẻ thẻ có ảnh cá nhân; liên kết công khai dùng avatar mặc định.</p>
        <label
          className="consent-checkbox"
          style={{
            cursor: 'pointer',
            alignItems: 'flex-start',
          }}
        >
          <input
            type="checkbox"
            checked={mediaPermission}
            onChange={(e) => setMediaPermission(e.target.checked)}
          />
          <div>
            <span>Cho phép CLB sử dụng tên và kết quả STARPRINT cho truyền thông sự kiện</span>
          </div>
        </label>
      </div>

      {error && <p className="field-error" style={{ marginTop: '8px', fontSize: '12px' }}>{error}</p>}

      <div className="publish-consent__actions">
        <button
          className="btn btn--outline btn--sm"
          disabled={saving}
          onClick={savePreferences}
        >
          {saving ? 'Đang lưu...' : 'Lưu tùy chọn'}
        </button>
        {saved && <span className="publish-consent__saved">✓ Đã cập nhật thành công!</span>}
      </div>
    </div>
  )
}
