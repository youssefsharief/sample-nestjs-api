import { IsString, IsEmail, MaxLength, MinLength } from 'class-validator';

export class UpdateInfoDto {
    @IsString() @MaxLength(20) @MinLength(3) readonly name!: string;
    @IsEmail() readonly email!: string;
}
