import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersDb {
    constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

    createUser(name: string, email: string, password: string, role: string): Promise<User> {
        const newUser = new this.userModel({ name, email, password, role });
        return newUser.save();
    }

    getUserByEmail(email: string) {
        return this.userModel
            .findOne({ email })
            .select('-__v')
            .exec();
    }

    getUserById(_id: string) {
        return this.userModel
            .findOne({ _id })
            .select('-__v')
            .exec();
    }

    updateUserInfo(_id: string, name: string, email: string) {
        return this.userModel
            .findOneAndUpdate({ _id }, { $set: { name, email } }, { new: true })
            .select('-password -__v')
            .exec();
    }

    updateRole(_id: string, role: string) {
        return this.userModel
            .findOneAndUpdate({ _id }, { $set: { role } }, { new: true })
            .select('-password -__v')
            .exec();
    }
}
