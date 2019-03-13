import { IsString, Max, Min, Matches, IsEmail } from 'class-validator';
import { passwordRegex } from 'src/common/config/regex-contstants';

export class SignupDto {
    @IsString() @Max(20) @Min(3) readonly name!: string;
    @IsEmail() readonly email!: string;
    @Matches(passwordRegex) readonly password!: string;
}
