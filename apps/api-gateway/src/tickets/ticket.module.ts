import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TicketsController } from './ticket.controller';
import { TicketsService } from './ticket.service';

@Module({
  imports: [HttpModule],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
