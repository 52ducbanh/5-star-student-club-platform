import { submitContact } from './api/contactApi'

export interface ContactPayload {
  name: string
  email: string
  message: string
}

export interface ContactService {
  submit(payload: ContactPayload): Promise<void>
}

class RealContactService implements ContactService {
  async submit(payload: ContactPayload): Promise<void> {
    await submitContact(payload)
  }
}

export const contactService: ContactService = new RealContactService()
