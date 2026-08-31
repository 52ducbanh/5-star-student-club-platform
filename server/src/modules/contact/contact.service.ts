import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactSubmission } from './entities/contact-submission.entity';
import { ContactDto } from './dto/contact.dto';
import type { ContactResponse } from '@5ss/contracts';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactSubmission)
    private readonly contactRepository: Repository<ContactSubmission>,
  ) {}

  async submit(dto: ContactDto): Promise<ContactResponse> {
    const submission = this.contactRepository.create({
      name: dto.name.trim(),
      email: dto.email.trim().toLowerCase(),
      message: dto.message.trim(),
    });
    await this.contactRepository.save(submission);
    return { ok: true };
  }
}
