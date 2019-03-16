import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../src/users/schemas/user.schema';

@Injectable()
export class UsersDbTestingOperations {
    constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

    createUser(name: string, email: string, password: string, role: string) {
        const newUser = new this.userModel({ name, email, password, role });
        return newUser.save();
    }

    removeAllUsers() {
        return this.userModel.remove({}).exec();
    }
}
