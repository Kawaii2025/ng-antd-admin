import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class SigninUserDto {
  @Transform(({ value }) => value || undefined)
  @IsString()
  @IsNotEmpty()
  userName?: string;

  @Transform(({ value }) => value || undefined)
  @IsString()
  @IsNotEmpty()
  user_name?: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
