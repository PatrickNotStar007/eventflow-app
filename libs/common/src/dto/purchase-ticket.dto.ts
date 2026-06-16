import { IsInt, IsNotEmpty, IsUUID, Max, Min } from 'class-validator';

export class PurchaseTicketDto {
  @IsUUID('4', { message: 'ID события должен быть валидным UUID' })
  @IsNotEmpty({ message: 'ID события не должен быть пустым' })
  eventId: string;

  @IsInt({ message: 'Количество должно быть целым числом' })
  @Min(1, { message: 'Количество должно быть минимум 1' })
  @Max(10, { message: 'Количество должно быть максимум 10' })
  quantity: number;
}
