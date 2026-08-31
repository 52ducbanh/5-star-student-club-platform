import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Request body for POST /api/events/:eventId/registrations
 * eventId is the route param — NOT included in this body.
 */
export class RegisterEventDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  /**
   * Must match existing client-side validation: /^[A-Za-z0-9-]{4,20}$/
   */
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/^[A-Za-z0-9-]{4,20}$/, {
    message: 'studentId must be 4–20 alphanumeric characters or hyphens',
  })
  studentId: string;

  @IsEmail()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  email: string;

  /**
   * Matches existing client-side isValidPhone: 9–15 chars with 9–12 digits
   */
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/^\+?[\d\s()./-]{9,15}$/, {
    message: 'phone must contain 9–12 digits',
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  unit: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  message?: string;
}
