import { IsString, Matches, IsEmail, MaxLength, MinLength } from 'class-validator';
import { passwordRegex } from '../../common/constants/regex-contstants';

export class SignupDto {
    @IsString() @MaxLength(20) @MinLength(3) readonly name!: string;
    @IsEmail() readonly email!: string;
    @Matches(passwordRegex) readonly password!: string;
}
