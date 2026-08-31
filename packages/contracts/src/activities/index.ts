export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  tag: string;
  imageUrl: string | null;
  publishedAt: string; // ISO 8601
}

export type DerivedEventStatus = "upcoming" | "past";

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  location: string;
  imageUrl: string | null;
  startAt: string; // ISO 8601
  endAt: string | null;
  registrationDeadline: string | null;
  capacity: number | null;
  registrationEnabled: boolean;
  /** Server-derived: registrationEnabled AND deadline not passed (capacity not checked here) */
  registrationAvailable: boolean;
  /** Derived: now > (endAt ?? startAt) → 'past', otherwise 'upcoming' */
  status: DerivedEventStatus;
}

/**
 * eventId is NOT included here — it belongs to the route param:
 * POST /api/events/:eventId/registrations
 */
export interface RegistrationRequest {
  name: string;
  studentId: string;
  email: string;
  phone: string;
  unit: string;
  message?: string;
}

export interface RegistrationResponse {
  id: string;
}

export interface ContactRequest {
  name: string;
  email: string;
  message: string;
}

export interface ContactResponse {
  ok: true;
}
