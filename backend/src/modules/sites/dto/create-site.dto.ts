
import {
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateSiteDto {
  @IsString()
  @Length(1, 253)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.zz)?$/i, {
    message: 'Address must contain a valid .zz website address.',
  })
  address: string;

  @IsString()
  @Length(1, 100)
  title: string;

  @IsString()
  @Length(1, 50000)
  html: string;

  @IsString()
  @Length(1, 100)
  author: string;
}
