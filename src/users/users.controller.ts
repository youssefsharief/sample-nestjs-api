import {
    Get,
    Controller,
    Post,
    Param,
    Put,
    Body,
    UseGuards,
    UseInterceptors,
    ConflictException,
    UsePipes,
    ValidationPipe,
    UnauthorizedException,
    NotFoundException,
    Patch,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { UsersDb } from './users.db';
import { LoginDto } from './dto/login.dto';
import { DurationLoggerInterceptor } from '../common/interceptors/duration-logger.interceptor';
import { clearUnneededDataFromPayload } from './utility/utility-service';
import { UpdateInfoDto } from './dto/update-info.dto';
import { ROLES } from '../common/constants/roles-constants';
import { jwtModule } from '../common/auth/jwt';
import { hashModule } from '../common/auth/hash';
import { AllowValidAuthTokenGuard } from '../common/guards/allow-valid-auth-token.guard';
import { AllowOnlyMyselfGuard } from '../common/guards/allow-only-myself.guard';
import { AllowOnlyManagersGuard } from '../common/guards/allow-only-managers.guard';

@Controller('api/users')
@UseInterceptors(DurationLoggerInterceptor)
export class UsersController {
    constructor(private readonly usersDb: UsersDb) {}

    @UseGuards(AllowValidAuthTokenGuard, AllowOnlyManagersGuard)
    @Get('protected')
    protected(): { protected: string } {
        return { protected: 'yeah' };
    }

    @UseGuards(AllowValidAuthTokenGuard, AllowOnlyManagersGuard)
    @Patch(':id/upgradeRole')
    async upgradeRole(@Param() params: { id: string }) {
        const user = await this.usersDb.updateRole(params.id, ROLES.manager);
        if (!user) {
            throw new NotFoundException('User does not exist');
        }
        return { updated: true };
    }

    @UseGuards(AllowValidAuthTokenGuard, AllowOnlyMyselfGuard)
    @Get(':id/info')
    async getUserInfo(@Param() params: { id: string }) {
        const user = await this.usersDb.getUserById(params.id);
        if (!user) {
            throw new NotFoundException('User does not exist');
        }
        return clearUnneededDataFromPayload(user);
    }

    @UseGuards(AllowValidAuthTokenGuard, AllowOnlyMyselfGuard)
    @Put(':id/info')
    @UsePipes(ValidationPipe)
    async updateUserInfo(@Param() params: { id: string }, @Body() updateInfoDto: UpdateInfoDto) {
        const user = await this.usersDb.updateUserInfo(params.id, updateInfoDto.name, updateInfoDto.email);
        if (!user) {
            throw new NotFoundException('User does not exist');
        } else {
            return { updated: true };
        }
    }

    @Post()
    @UsePipes(ValidationPipe)
    async signup(@Body() signupDto: SignupDto) {
        try {
            const user = await this.usersDb.createUser(
                signupDto.name,
                signupDto.email,
                await hashModule.hash(signupDto.password),
                ROLES.regular,
            );
            return { user: clearUnneededDataFromPayload(user), token: jwtModule.sign(user._id, user.role) };
        } catch (e) {
            if (e.code === 11000) {
                throw new ConflictException('Email already exists');
            } else {
                throw e;
            }
        }
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UsePipes(ValidationPipe)
    async login(@Body() loginDto: LoginDto) {
        const wrongCredentialsMessage = 'Email or/and password are wrong';
        const user = await this.usersDb.getUserByEmail(loginDto.email);
        if (!user) {
            throw new UnauthorizedException(wrongCredentialsMessage);
        } else {
            const isPasswordRight = await hashModule.isPasswordRight(loginDto.password, user.password);
            if (!isPasswordRight) {
                throw new UnauthorizedException(wrongCredentialsMessage);
            } else {
                return { user: clearUnneededDataFromPayload(user), token: jwtModule.sign(user._id, user.role) };
            }
        }
    }
}
