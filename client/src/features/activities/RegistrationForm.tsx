import { useState, type FormEvent } from 'react'
import { AlertCircle, CheckCircle2, LockKeyhole, Send, Loader2 } from 'lucide-react'
import { siteConfig } from '../../config/site'
import { isValidEmail, isValidPhone, required } from '../forms/validation'
import { submitRegistration } from '../forms/api/registrationApi'

type RegistrationValues = {
  fullName: string
  studentId: string
  email: string
  phone: string
  unit: string
  message: string
}

const initialValues: RegistrationValues = {
  fullName: '',
  studentId: '',
  email: '',
  phone: '',
  unit: '',
  message: '',
}

export function RegistrationForm({
  eventId,
  eventTitle,
  onDone,
}: {
  eventId: string
  eventTitle: string
  onDone: () => void
}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationValues, string>>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const update = (field: keyof RegistrationValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setServerError(null)
  }

  const validate = () => {
    const next: Partial<Record<keyof RegistrationValues, string>> = {}
    if (!required(values.fullName)) next.fullName = 'Vui lòng nhập họ và tên.'
    if (!required(values.studentId)) next.studentId = 'Vui lòng nhập mã sinh viên.'
    else if (!/^[A-Za-z0-9-]{4,20}$/.test(values.studentId.trim())) next.studentId = 'Mã sinh viên chưa đúng định dạng cơ bản.'
    if (!required(values.email)) next.email = 'Vui lòng nhập email.'
    else if (!isValidEmail(values.email)) next.email = siteConfig.emailDomain ? `Email cần dùng domain @${siteConfig.emailDomain.replace(/^@/, '')}.` : 'Email chưa đúng cú pháp.'
    if (!required(values.phone)) next.phone = 'Vui lòng nhập số điện thoại.'
    else if (!isValidPhone(values.phone)) next.phone = 'Số điện thoại cần có 9–12 chữ số.'
    if (!required(values.unit)) next.unit = 'Vui lòng nhập lớp hoặc đơn vị.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setServerError(null)
    if (!validate()) return
    setLoading(true)
    try {
      await submitRegistration(eventId, {
        name: values.fullName,
        studentId: values.studentId,
        email: values.email,
        phone: values.phone,
        unit: values.unit,
        message: values.message.trim() || undefined,
      })
      setSuccess(true)
      setValues(initialValues)
    } catch (err: any) {
      setServerError(err?.message || 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="form-success" role="status">
        <span><CheckCircle2 size={30} aria-hidden="true" /></span>
        <h3>Đăng ký thành công!</h3>
        <p>Đăng ký của bạn cho “{eventTitle}” đã được ghi nhận thành công.</p>
        <button type="button" className="btn btn--primary" onClick={onDone}>Hoàn tất</button>
      </div>
    )
  }

  return (
    <form className="app-form registration-form" onSubmit={submit} noValidate>
      <div className="form-note"><LockKeyhole size={16} aria-hidden="true" /> Thông tin của bạn được lưu bảo mật.</div>
      {serverError && (
        <div className="form-error-banner" role="alert" style={{ color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <AlertCircle size={18} aria-hidden="true" />
          <span>{serverError}</span>
        </div>
      )}
      <div className="form-grid">
        <FormField label="Họ và tên" name="fullName" value={values.fullName} error={errors.fullName} required onChange={(value) => update('fullName', value)} autoComplete="name" />
        <FormField label="Mã sinh viên" name="studentId" value={values.studentId} error={errors.studentId} required onChange={(value) => update('studentId', value)} />
        <FormField label="Email UET" name="email" type="email" value={values.email} error={errors.email} required onChange={(value) => update('email', value)} autoComplete="email" hint={siteConfig.emailDomain ? `Sử dụng domain @${siteConfig.emailDomain.replace(/^@/, '')}` : 'Domain email UET đang chờ cấu hình.'} />
        <FormField label="Số điện thoại" name="phone" type="tel" value={values.phone} error={errors.phone} required onChange={(value) => update('phone', value)} autoComplete="tel" />
        <FormField label="Lớp / đơn vị" name="unit" value={values.unit} error={errors.unit} required onChange={(value) => update('unit', value)} />
        <label className="form-field form-field--full">
          <span>Lời nhắn <small>Không bắt buộc</small></span>
          <textarea name="message" rows={3} value={values.message} onChange={(event) => update('message', event.target.value)} placeholder="Bạn muốn CLB biết thêm điều gì?" />
        </label>
      </div>
      <button className="btn btn--primary form-submit" type="submit" disabled={loading}>
        {loading ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <Send size={17} aria-hidden="true" />}
        {loading ? 'Đang gửi...' : 'Hoàn tất đăng ký'}
      </button>
    </form>
  )
}

type FormFieldProps = {
  label: string
  name: string
  value: string
  error?: string
  hint?: string
  type?: string
  required?: boolean
  autoComplete?: string
  onChange: (value: string) => void
}

function FormField({ label, name, value, error, hint, type = 'text', required: isRequired, autoComplete, onChange }: FormFieldProps) {
  const errorId = `${name}-error`
  const hintId = `${name}-hint`
  return (
    <label className="form-field">
      <span>{label}{isRequired && <b aria-hidden="true"> *</b>}</span>
      <input
        name={name}
        type={type}
        value={value}
        required={isRequired}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <small id={errorId} className="field-error">{error}</small> : hint ? <small id={hintId} className="field-hint">{hint}</small> : null}
    </label>
  )
}
