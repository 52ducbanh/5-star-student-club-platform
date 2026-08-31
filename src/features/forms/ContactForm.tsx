import { useState, type FormEvent } from 'react'
import { CheckCircle2, Send } from 'lucide-react'
import { isValidEmail, required } from './validation'

type ContactValues = { name: string; email: string; message: string }
const initialValues: ContactValues = { name: '', email: '', message: '' }

export function ContactForm() {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof ContactValues, string>>>({})
  const [success, setSuccess] = useState(false)

  const update = (field: keyof ContactValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setSuccess(false)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const next: Partial<Record<keyof ContactValues, string>> = {}
    if (!required(values.name)) next.name = 'Vui lòng nhập họ tên.'
    if (!required(values.email)) next.email = 'Vui lòng nhập email.'
    else if (!isValidEmail(values.email)) next.email = 'Email chưa đúng cú pháp.'
    if (!required(values.message)) next.message = 'Vui lòng nhập nội dung.'
    else if (values.message.trim().length < 10) next.message = 'Nội dung cần ít nhất 10 ký tự.'
    setErrors(next)
    if (Object.keys(next).length) return
    setValues(initialValues)
    setSuccess(true)
  }

  return (
    <form className="app-form contact-form" onSubmit={submit} noValidate>
      {success && (
        <div className="form-success-banner" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span><strong>Đã gửi thành công trong bản mô phỏng.</strong> Nội dung không được chuyển tới máy chủ.</span>
        </div>
      )}
      <label className="form-field">
        <span>Họ tên <b aria-hidden="true">*</b></span>
        <input name="name" value={values.name} autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'contact-name-error' : undefined} onChange={(event) => update('name', event.target.value)} />
        {errors.name && <small id="contact-name-error" className="field-error">{errors.name}</small>}
      </label>
      <label className="form-field">
        <span>Email <b aria-hidden="true">*</b></span>
        <input name="email" type="email" value={values.email} autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'contact-email-error' : undefined} onChange={(event) => update('email', event.target.value)} />
        {errors.email && <small id="contact-email-error" className="field-error">{errors.email}</small>}
      </label>
      <label className="form-field">
        <span>Nội dung <b aria-hidden="true">*</b></span>
        <textarea name="message" rows={5} value={values.message} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'contact-message-error' : undefined} onChange={(event) => update('message', event.target.value)} placeholder="Nhập lời nhắn của bạn..." />
        {errors.message && <small id="contact-message-error" className="field-error">{errors.message}</small>}
      </label>
      <button type="submit" className="btn btn--primary form-submit"><Send size={17} aria-hidden="true" /> Gửi lời nhắn demo</button>
    </form>
  )
}
