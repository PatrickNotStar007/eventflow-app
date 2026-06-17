import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { TicketServiceService } from './ticket-service.service';
import { CheckInTicketDto, PurchaseTicketDto } from '@app/common';

@Controller()
export class TicketServiceController {
  constructor(private readonly ticketServiceService: TicketServiceService) {}

  @Post('purchase')
  purchase(
    @Body() purchaseDto: PurchaseTicketDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.ticketServiceService.purchase(purchaseDto, userId);
  }

  @Get('my-tickets')
  findMyTickets(@Headers('x-user-id') userId: string) {
    return this.ticketServiceService.findMyTickets(userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.ticketServiceService.findOne(id, userId);
  }

  @Post(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.ticketServiceService.cancel(id, userId);
  }

  @Post('check-in')
  checkIn(
    @Body() checkInDto: CheckInTicketDto,
    @Headers('x-user-id') organizerId: string,
  ) {
    return this.ticketServiceService.checkIn(
      checkInDto.ticketCode,
      organizerId,
    );
  }

  @Get('event/:eventId')
  findEventTickets(
    @Param('id', ParseUUIDPipe) eventId: string,
    @Headers('x-user-id') organizerId: string,
  ) {
    return this.ticketServiceService.findEventTickets(eventId, organizerId);
  }
}
