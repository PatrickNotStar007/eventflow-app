import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CheckInTicketDto, PurchaseTicketDto } from '@app/common';
import { TicketsService } from './ticket.service';

@Controller('tickets')
@UseGuards(AuthGuard('jwt'))
export class TicketsController {
  constructor(private readonly ticketService: TicketsService) {}

  @Post('purchase')
  purchase(
    @Body() purchaseDto: PurchaseTicketDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.ticketService.purchase(purchaseDto, req.user.userId);
  }

  @Get('my-tickets')
  findMyTickets(@Request() req: { user: { userId: string } }) {
    return this.ticketService.findMyTickets(req.user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.ticketService.findMyTickets(req.user.userId);
  }

  @Post(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.ticketService.cancel(id, req.user.userId);
  }

  @Post('check-in')
  checkIn(
    @Body() checkInDto: CheckInTicketDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.ticketService.checkIn(checkInDto, req.user.userId);
  }

  @Get('event/:eventId')
  findEventTickets(
    @Param('id', ParseUUIDPipe) eventId: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.ticketService.findEventTicket(eventId, req.user.userId);
  }
}
