import { HttpException, HttpStatus } from '@nestjs/common';
import { DomainErrorCode } from './domain-error.enum';

export class DomainException extends HttpException {
  constructor(
    public readonly code: DomainErrorCode,
    public readonly message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super({ code, message }, status);
  }
}
