
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

import { VisitSource } from '../visit.schema';

export class CreateVisitDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  person: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(253)
  address: string;

  @IsEnum(VisitSource)
  via: VisitSource;

  @IsBoolean()
  found: boolean;
}
