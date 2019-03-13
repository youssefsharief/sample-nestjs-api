import { Matches, IsEmail } from 'class-validator';
import { passwordRegex } from 'src/common/config/regex-contstants';

export class LoginDto {
    @IsEmail() readonly email!: string;
    @Matches(passwordRegex) readonly password!: string;
}
