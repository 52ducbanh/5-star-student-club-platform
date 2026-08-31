import { submitRegistration } from './api/registrationApi'

export interface RegistrationPayload {
  name: string
  studentId: string
  email: string
  phone: string
  unit?: string
  message?: string
  eventId: string
}

export interface RegistrationService {
  submit(payload: RegistrationPayload): Promise<void>
}

class RealRegistrationService implements RegistrationService {
  async submit(payload: RegistrationPayload): Promise<void> {
    const { eventId, ...rest } = payload
    await submitRegistration(eventId, {
      name: rest.name,
      studentId: rest.studentId,
      email: rest.email,
      phone: rest.phone,
      unit: rest.unit || '',
      message: rest.message,
    })
  }
}

export const registrationService: RegistrationService = new RealRegistrationService()
