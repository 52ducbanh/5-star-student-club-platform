import { useState } from 'react'
import { starprintApi } from '../services/starprintApi'

interface Props {
  starprintId: string
  sessionId?: string
  initialPhysicalCard?: boolean
  initialMediaPermission?: boolean
}

export function PublishConsent({
  starprintId,
  sessionId,
  initialPhysicalCard = true,
  initialMediaPermission = true,
}: Props) {
  const [physicalCardRequested, setPhysicalCardRequested] = useState(initialPhysicalCard)
  const [mediaPermission, setMediaPermission] = useState(
    initialPhysicalCard ? true : initialMediaPermission,
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCardChange = (checked: boolean) => {
    setPhysicalCardRequested(checked)
    if (checked) {
      setMediaPermission(true)
    }
  }

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
        // Product rule: nickname and portrait are always included in 5SS Sky.
        // These controls have been removed from the user-facing UI.
        consentName: true,
        consentPhoto: true,
        physicalCardRequested,
        mediaPermission: physicalCardRequested ? true : mediaPermission,
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
        <label
          className="consent-checkbox"
          style={{
            cursor: 'pointer',
            alignItems: 'flex-start',
          }}
        >
          <input
            type="checkbox"
            checked={physicalCardRequested}
            onChange={(e) => handleCardChange(e.target.checked)}
          />
          <div>
            <strong>Đăng ký nhận STAR CARD vật lý tại booth sự kiện</strong>
            <div className="publish-consent__sub">
              Ban tổ chức sẽ in thẻ STAR CARD riêng cho bạn tại ngày hội.
            </div>
          </div>
        </label>

        <label
          className="consent-checkbox"
          style={{
            cursor: physicalCardRequested ? 'not-allowed' : 'pointer',
            opacity: physicalCardRequested ? 0.9 : 1,
            alignItems: 'flex-start',
          }}
        >
          <input
            type="checkbox"
            checked={physicalCardRequested || mediaPermission}
            disabled={physicalCardRequested}
            onChange={(e) => setMediaPermission(e.target.checked)}
          />
          <div>
            <span>Cho phép CLB sử dụng tên và ảnh cho ấn phẩm truyền thông sự kiện (Media Permission)</span>
            {physicalCardRequested && (
              <span className="publish-consent__forced">
                ✓ Tự động kích hoạt khi đăng ký nhận thẻ STAR CARD vật lý
              </span>
            )}
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
          {saving ? 'Đang lưu...' : 'Lưu tùy chọn nhận thẻ'}
        </button>
        {saved && <span className="publish-consent__saved">✓ Đã cập nhật thành công!</span>}
      </div>
    </div>
  )
}
