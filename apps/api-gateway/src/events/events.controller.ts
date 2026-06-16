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
import { EventsService } from './events.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateEventDto, UpdateEventDto } from '@app/common';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-events')
  findMyEvents(@Request() req: { user: { userId: string } }) {
    return this.eventsService.findMyEvents(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() CreateEventDto: CreateEventDto,
    @Request() req: { user: { userId: string; role?: string } },
  ) {
    return this.eventsService.create(
      CreateEventDto,
      req.user.userId,
      req.user.role || 'USER',
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req: { user: { userId: string; role?: string } },
  ) {
    return this.eventsService.update(
      id,
      updateEventDto,
      req.user.userId,
      req.user.role || 'USER',
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  publish(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: { userId: string; role?: string } },
  ) {
    return this.eventsService.publish(
      id,
      req.user.userId,
      req.user.role || 'USER',
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: { userId: string; role?: string } },
  ) {
    return this.eventsService.cancel(
      id,
      req.user.userId,
      req.user.role || 'USER',
    );
  }
}
