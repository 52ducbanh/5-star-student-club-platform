export interface ContactPayload {
  name: string
  email: string
  message: string
}

export interface ContactService {
  submit(payload: ContactPayload): Promise<void>
}

/**
 * Simulation adapter. Replace with real HTTP call when backend is ready.
 */
class SimulatedContactService implements ContactService {
  async submit(_payload: ContactPayload): Promise<void> {
    // Simulated async delay
    await new Promise<void>((resolve) => setTimeout(resolve, 800))
  }
}

export const contactService: ContactService = new SimulatedContactService()
