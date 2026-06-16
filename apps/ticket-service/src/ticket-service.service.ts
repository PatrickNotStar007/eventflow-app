import { PurchaseTicketDto } from '@app/common';
import { DatabaseService, events, tickets } from '@app/database';
import { KAFKA_SERVICE, KAFKA_TOPICS } from '@app/kafka';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomBytes } from 'crypto';
import { and, eq, sql } from 'drizzle-orm';

@Injectable()
export class TicketServiceService implements OnModuleInit {
  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
    private readonly dbseService: DatabaseService,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  private generateTicketCode(): string {
    return randomBytes(6).toString('hex').toUpperCase();
  }

  async purchase(purchaseDto: PurchaseTicketDto, userId: string) {
    const { eventId, quantity } = purchaseDto;

    const [event] = await this.dbseService.db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      throw new NotFoundException('Событие не найдено');
    }

    if (event.status !== 'PUBLISHED') {
      throw new BadRequestException('Событие не опубликовано');
    }

    const soldTickets = await this.dbseService.db
      .select({
        total: sql<number>`COALESCE(SUM(${tickets.quantity}), 0)`,
      })
      .from(tickets)
      .where(
        and(eq(tickets.eventId, eventId), eq(tickets.status, 'CONFIRMED')),
      );

    const currentSold = Number(soldTickets[0]?.total || 0);
    const remaining = event.capacity - currentSold;

    if (quantity > remaining) {
      throw new BadRequestException(`Осталось только ${remaining} билетов`);
    }

    const totalPrice = event.price * quantity;

    const [ticket] = await this.dbseService.db
      .insert(tickets)
      .values({
        eventId,
        userId,
        quantity,
        totalPrice,
        ticketCode: this.generateTicketCode(),
        status: 'CONFIRMED',
      })
      .returning();

    this.kafkaClient.emit(KAFKA_TOPICS.TICKET_PURCHASED, {
      ticketId: ticket.id,
      eventId: ticket.eventId,
      userId: ticket.userId,
      quantity: ticket.quantity,
      totalPrice: ticket.totalPrice,
      ticketCode: ticket.ticketCode,
      timestamp: new Date().toISOString(),
    });

    return {
      message: 'Билет успешно куплен',
      ticket: {
        id: ticket.ticketCode,
        eventTitle: event.title,
        quantity: ticket.quantity,
        totalPrice: ticket.totalPrice,
        status: ticket.status,
        purchaseAt: ticket.purchasedAt,
      },
    };
  }

  async findMyTicket(userId: string) {
    const userTickets = await this.dbseService.db
      .select({
        id: tickets.id,
        ticketCode: tickets.ticketCode,
        quantity: tickets.quantity,
        totalPrice: tickets.totalPrice,
        status: tickets.status,
        purchasedAt: tickets.purchasedAt,
        checkedInAt: tickets.checkedInAt,
        eventId: events.id,
        eventTitle: events.title,
        eventDate: events.date,
        eventLocation: events.location,
      })
      .from(tickets)
      .innerJoin(events, eq(tickets.eventId, events.id))
      .where(eq(tickets.userId, userId));

    return userTickets;
  }

  async findOne(id: string, userId: string) {
    const [ticket] = await this.dbseService.db
      .select({
        id: tickets.id,
        ticketCode: tickets.ticketCode,
        quantity: tickets.quantity,
        totalPrice: tickets.totalPrice,
        status: tickets.status,
        purchasedAt: tickets.purchasedAt,
        checkedInAt: tickets.checkedInAt,
        userId: tickets.userId,
        eventId: events.id,
        eventTitle: events.title,
        eventDate: events.date,
        eventLocation: events.location,
      })
      .from(tickets)
      .innerJoin(events, eq(tickets.eventId, events.id))
      .where(and(eq(tickets.id, id), eq(tickets.userId, userId)))
      .limit(1);

    if (!ticket) {
      throw new NotFoundException('Билет не найден');
    }

    if (ticket.userId !== userId) {
      throw new ForbiddenException('Билет не принадлежит пользователю');
    }

    return ticket;
  }

  async cancel(id: string, userId: string) {
    const [ticket] = await this.dbseService.db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id))
      .limit(1);

    if (!ticket) {
      throw new NotFoundException('Билет не найден');
    }

    if (ticket.userId !== userId) {
      throw new ForbiddenException('Билет не принадлежит пользователю');
    }

    if (ticket.status === 'CANCELLED') {
      throw new BadRequestException('Билет уже отменён');
    }

    if (ticket.status === 'CHECKED_IN') {
      throw new BadRequestException('Билет уже использован');
    }

    const [cancelled] = await this.dbseService.db
      .update(tickets)
      .set({ status: 'CANCELLED', updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();

    this.kafkaClient.emit(KAFKA_TOPICS.TICKET_CANCELED, {
      ticketId: cancelled.id,
      eventId: cancelled.eventId,
      userId: cancelled.userId,
      timestamp: new Date().toISOString(),
    });

    return { message: 'Билет успешно отменён' };
  }

  async checkIn(ticketCode: string, organizerId: string) {
    const [ticket] = await this.dbseService.db
      .select({
        id: tickets.id,
        status: tickets.status,
        eventId: events.id,
        quantity: tickets.quantity,
      })
      .from(tickets)
      .where(eq(tickets.ticketCode, ticketCode))
      .limit(1);

    if (!ticket) {
      throw new NotFoundException('Билет не найден');
    }

    const [event] = await this.dbseService.db
      .select()
      .from(events)
      .where(eq(events.id, ticket.eventId))
      .limit(1);

    if (event.organizerId !== organizerId) {
      throw new ForbiddenException('Вы не можете использовать этот билет');
    }

    if (ticket.status === 'CHECKED_IN') {
      throw new BadRequestException('Билет уже использован');
    }

    if (ticket.status === 'CANCELLED') {
      throw new BadRequestException('Билет уже отменён');
    }

    const [checkedIn] = await this.dbseService.db
      .update(tickets)
      .set({
        status: 'CHECKED_IN',
        checkedInAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, ticket.id))
      .returning();

    this.kafkaClient.emit(KAFKA_TOPICS.TICKET_CANCELED, {
      ticketId: checkedIn.id,
      eventId: checkedIn.eventId,
      ticketCode: checkedIn.ticketCode,
      timestamp: new Date().toISOString(),
    });

    return {
      message: 'Билет успешно использован',
      ticket: {
        id: checkedIn.id,
        ticketCode: checkedIn.ticketCode,
        quantity: checkedIn.quantity,
        status: checkedIn.status,
        checkedInAt: checkedIn.checkedInAt,
      },
    };
  }

  async findEventTickets(eventId: string, organizerId: string) {
    const [event] = await this.dbseService.db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      throw new NotFoundException('Событие не найдено');
    }

    if (event.organizerId !== organizerId) {
      throw new ForbiddenException('Вы не можете использовать этот билет');
    }

    return await this.dbseService.db
      .select()
      .from(tickets)
      .where(eq(tickets.eventId, eventId));
  }
}
