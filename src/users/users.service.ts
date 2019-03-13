import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignupDto } from './dto/signup.dto';
import { ROLES } from 'src/common/config/roles-constants';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

    getHello(): string {
        return 'Hello World!';
    }

    async signup(payload: SignupDto): Promise<User> {
        const createdUser = new this.userModel({ ...payload, role: ROLES.regular });
        return await createdUser.save();
    }

    async getUserByEmail(email: string): Promise<User> {
        return this.userModel
            .findOne({ email })
            .select('-__v')
            .exec();
    }

    async getUserInfo(_id: string): Promise<User> {
        return this.userModel
            .findOne({ _id })
            .select('-__v')
            .exec();
    }

    async updateUserInfo(_id: string, payload: object) {
        return this.userModel.findOneAndUpdate({ _id }, payload, { new: true }).select('-password -__v');
    }
}
