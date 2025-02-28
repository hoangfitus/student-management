import {
  IsNotEmpty,
  IsString,
  IsIn,
  IsEmail,
  IsPhoneNumber,
  Length,
  IsDateString,
  Matches,
} from 'class-validator';

export class CreateStudentDto {
  @IsNotEmpty()
  @Length(8, 8)
  mssv: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsDateString()
  dob: string;

  @IsNotEmpty()
  @IsIn(['Nam', 'Nữ', 'Khác'])
  gender: string;

  @IsNotEmpty()
  @IsString()
  faculty: string;

  @IsNotEmpty()
  @IsString()
  course: string;

  @IsNotEmpty()
  @IsString()
  program: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(/^(?:0[35789]\d{8}|\+84[35789]\d{8})$/, {
    message:
      'Phone number must be valid for Vietnam (either +84 or 0 followed by 3,5,7,8, or 9 and 8 digits)',
  })
  phone: string;

  @IsNotEmpty()
  @IsString()
  status: string;
}
