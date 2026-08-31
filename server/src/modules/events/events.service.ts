import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Event } from './entities/event.entity';
import { EventRegistration } from './entities/event-registration.entity';
import { RegisterEventDto } from './dto/register-event.dto';
import { DomainException } from '../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../common/exceptions/domain-error.enum';
import type { DerivedEventStatus, EventItem, RegistrationResponse } from '@5ss/contracts';

/** Derive upcoming/past from startAt and optional endAt */
function deriveStatus(event: Event, now: Date): DerivedEventStatus {
  const comparisonTime = event.endAt ?? event.startAt;
  return now > comparisonTime ? 'past' : 'upcoming';
}

/** Derive whether registration is available (does not check capacity — requires DB call) */
function deriveRegistrationAvailable(event: Event, now: Date): boolean {
  if (!event.registrationEnabled) return false;
  if (event.registrationDeadline && now > event.registrationDeadline) return false;
  return true;
}

function toDto(event: Event, now: Date): EventItem {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    excerpt: event.excerpt,
    body: event.body,
    location: event.location,
    imageUrl: event.imageUrl,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt ? event.endAt.toISOString() : null,
    registrationDeadline: event.registrationDeadline
      ? event.registrationDeadline.toISOString()
      : null,
    capacity: event.capacity,
    registrationEnabled: event.registrationEnabled,
    registrationAvailable: deriveRegistrationAvailable(event, now),
    status: deriveStatus(event, now),
  };
}

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(EventRegistration)
    private readonly registrationRepository: Repository<EventRegistration>,
    private readonly dataSource: DataSource,
  ) {}

  /** Returns all published events ordered by startAt DESC */
  async findAll(): Promise<EventItem[]> {
    const now = new Date();
    const rows = await this.eventRepository
      .createQueryBuilder('e')
      .where('e.published = true')
      .orderBy('e.startAt', 'DESC')
      .getMany();
    return rows.map((e) => toDto(e, now));
  }

  /** Returns a single published event by slug */
  async findBySlug(slug: string): Promise<EventItem> {
    const now = new Date();
    const row = await this.eventRepository
      .createQueryBuilder('e')
      .where('e.slug = :slug', { slug })
      .andWhere('e.published = true')
      .getOne();
    if (!row) {
      throw new DomainException(
        DomainErrorCode.EVENT_NOT_FOUND,
        `Event '${slug}' not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return toDto(row, now);
  }

  /**
   * Register for an event.
   * Uses pessimistic row-lock (FOR UPDATE) on the Event to prevent
   * concurrent capacity violations.
   */
  async register(
    eventId: string,
    dto: RegisterEventDto,
  ): Promise<RegistrationResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Pessimistic lock — prevents concurrent capacity bypass
      const event = await queryRunner.manager.findOne(Event, {
        where: { id: eventId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!event || !event.published) {
        throw new DomainException(
          DomainErrorCode.EVENT_NOT_FOUND,
          `Event '${eventId}' not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const now = new Date();

      if (!event.registrationEnabled) {
        throw new DomainException(
          DomainErrorCode.EVENT_REGISTRATION_CLOSED,
          'Registration is not enabled for this event',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      if (event.registrationDeadline && now > event.registrationDeadline) {
        throw new DomainException(
          DomainErrorCode.EVENT_REGISTRATION_CLOSED,
          'Registration deadline has passed',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      if (event.capacity !== null) {
        const count = await queryRunner.manager.count(EventRegistration, {
          where: { eventId },
        });
        if (count >= event.capacity) {
          throw new DomainException(
            DomainErrorCode.EVENT_FULL,
            'Event is at full capacity',
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
      }

      // Normalize fields before persistence
      const normalizedStudentId = dto.studentId.trim();
      const normalizedEmail = dto.email.trim().toLowerCase();

      const registration = queryRunner.manager.create(EventRegistration, {
        eventId,
        name: dto.name,
        studentId: normalizedStudentId,
        email: normalizedEmail,
        phone: dto.phone,
        unit: dto.unit,
        message: dto.message ?? null,
      });

      try {
        const saved = await queryRunner.manager.save(EventRegistration, registration);
        await queryRunner.commitTransaction();
        return { id: saved.id };
      } catch (err: any) {
        // PostgreSQL unique violation code = 23505
        if (err?.code === '23505') {
          throw new DomainException(
            DomainErrorCode.DUPLICATE_REGISTRATION,
            'A registration with this student ID already exists for this event',
            HttpStatus.CONFLICT,
          );
        }
        throw err;
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
