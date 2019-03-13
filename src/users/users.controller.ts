import {
    Get,
    Controller,
    Post,
    HttpCode,
    Param,
    Put,
    Body,
    // UseInterceptors,
    UseGuards,
    ForbiddenException,
    Res,
    Response,
    Req,
    Request,
    UseInterceptors,
    // ConflictException,
    // UsePipes,
} from '@nestjs/common';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { SignupDto } from './dto/signup.dto';
import { UsersService } from './users.service';
import { LoginDto } from './dto/login.dto';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';

@Controller('api/users')
@UseGuards(RolesGuard)
@UseInterceptors(LoggingInterceptor)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('hello')
    getHello(): string {
        throw new ForbiddenException();
        return this.usersService.getHello();
    }

    @Roles('admin')
    @Get('protected')
    protected(): { protected: string } {
        return { protected: 'yeah' };
    }

    @Get(':id/info')
    getUserInfo(@Param() params: { id: string }) {
        return params.id;
    }

    @Put(':id/info')
    updateUserInfo(@Param() params: { id: string }) {
        return params.id;
    }

    @HttpCode(204)
    @Post()
    // @UsePipes(new JoiValidationPipe(createCatSchema))
    async signup(@Body() signupDto: SignupDto) {
        return this.usersService.signup(signupDto);
        // throw new ConflictException();
        // // UnsupportedMediaTypeException
        // // UnprocessableEntityException
        // return signupDto;
    }

    @HttpCode(204)
    @Post('login')
    // @UsePipes(new JoiValidationPipe(createCatSchema))
    async login(@Body() loginDto: LoginDto, @Res() res: Response, @Req() request: Request) {
        console.log('a', loginDto);
        return res.json();
        // console.log('req', request)
        // res.status(32)
        // return this.usersService.getUserByEmail(loginDto.email)

        // .then(user => {
        //     if (!user) {
        //         return res.status(401).json({ code: 2, msg: loginErr.message })
        //     }
        //     return comparePassword(req.body.password, user.password).then(ok => {
        //         if (!ok) return res.status(401).json({ code: 2, msg: loginErr.message })
        //         return res.status(200).json({ user: clearUnneededDataFromPayload(user), token: getToken(user._id, user.role) })
        //     }).catch(err => next(err))
        // // throw new ConflictException();
        // // // UnsupportedMediaTypeException
        // // // UnprocessableEntityException
        // // return signupDto;
    }

    @Get()
    findAll() {
        return 'This action returns all cats';
    }
}
