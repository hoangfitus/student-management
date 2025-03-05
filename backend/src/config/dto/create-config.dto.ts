import { IsNotEmpty, IsString } from 'class-validator';

export class CreateConfigDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}
