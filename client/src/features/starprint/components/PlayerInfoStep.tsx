import { useState, type FormEvent } from 'react'
import { useStarprintStore } from '../store/useStarprintStore'
import { starprintApi } from '../services/starprintApi'

export function PlayerInfoStep() {
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setNickname: storeNickname, setSessionId, setStep } = useStarprintStore()

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmed = nickname.trim()
    if (!trimmed) { setError('Vui lòng nhập biệt danh.'); return }
    if (trimmed.length > 24) { setError('Biệt danh tối đa 24 ký tự.'); return }
    setLoading(true)
    setError('')
    try {
      const session = await starprintApi.createSession({ nickname: trimmed })
      storeNickname(trimmed)
      setSessionId(session.id)
      setStep('CAMERA')
    } catch {
      setError('Không thể kết nối server. Kiểm tra lại kết nối.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="game-step player-info-step">
      <h2>Bạn là ai?</h2>
      <p>Nhập biệt danh để bắt đầu hành trình STARPRINT</p>
      <form onSubmit={submit} className="app-form">
        <label className="form-field">
          <span>Biệt danh <b aria-hidden>*</b></span>
          <input
            value={nickname}
            onChange={(e) => { setNickname(e.target.value); setError('') }}
            maxLength={24}
            placeholder="Ví dụ: Nguyễn Minh"
            autoFocus
          />
          {error && <small className="field-error">{error}</small>}
        </label>
        <button type="submit" disabled={loading} className="btn btn--primary">
          {loading ? 'Đang tạo...' : 'Tiếp theo →'}
        </button>
      </form>
    </div>
  )
}
