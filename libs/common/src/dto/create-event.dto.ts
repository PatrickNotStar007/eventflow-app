import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название является обязательным полем' })
  @MaxLength(255)
  title: string;

  @IsString({ message: 'Описание должно быть строкой' })
  @IsOptional()
  description?: string;

  @IsDateString({}, { message: 'Дата должна быть строкой в формате ISO' })
  @IsNotEmpty({ message: 'Дата является обязательным полем' })
  date: string;

  @IsString({ message: 'Место проведения должно быть строкой' })
  @IsNotEmpty({ message: 'Место проведения является обязательным полем' })
  @MaxLength(255)
  location: string;

  @IsInt()
  @Min(1, { message: 'Вместимость должна быть не меньше 1' })
  capacity: number;

  @IsInt()
  @Min(0, { message: 'Цена должна быть не меньше 0' })
  @IsOptional()
  price: number;
}
