import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  Matches,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsNotEmpty()
  @MaxLength(32)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak',
  })
  password: string;
}
