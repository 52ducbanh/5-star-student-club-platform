export interface RegistrationPayload {
  name: string
  studentId: string
  email: string
  phone: string
  eventId: string
}

export interface RegistrationService {
  submit(payload: RegistrationPayload): Promise<void>
}

class SimulatedRegistrationService implements RegistrationService {
  async submit(_payload: RegistrationPayload): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 1000))
  }
}

export const registrationService: RegistrationService = new SimulatedRegistrationService()
