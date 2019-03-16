import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class FakeDb {
    constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

    createUser(name: string, email: string, password: string, role: string) {
        return true;
    }
}
