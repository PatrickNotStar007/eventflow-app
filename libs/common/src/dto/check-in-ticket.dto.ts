import { IsNotEmpty, IsString } from 'class-validator';

export class CheckInTicketDto {
  @IsString({ message: 'Код билета должен быть строкой' })
  @IsNotEmpty({ message: 'Код билета обязателен' })
  ticketCode: string;
}
