import * as mongoose from 'mongoose';
import { ROLES } from 'src/common/config/roles-constants';
import * as bcrypt from 'bcrypt';
const SALT_WORK_FACTOR = 10;

const roles_enum = {
    values: [ROLES.regular, ROLES.manager],
    message: '`{VALUE}` is not a valid user role.',
};

export interface User extends mongoose.Document {
    readonly name: string;
    readonly email: number;
    readonly role: string;
    password: string;
}

export const UserSchema = new mongoose.Schema<User>({
    name: { type: String, required: true },
    email: { type: String, required: false, trim: true, index: true, unique: true, sparse: true },
    password: { type: String, required: false },
    role: { type: String, enum: roles_enum, required: true, default: 'regular' },
}).pre('save', function(next) {
    if (!this.isModified('password')) {
        return next();
    } else {
        bcrypt.genSalt(SALT_WORK_FACTOR, (err: Error, salt: string) => {
            if (err) {
                return next(err);
            }
            bcrypt.hash((this as User).password, salt, (err2: Error, hash: string) => {
                if (err2) {
                    return next(err2);
                }
                (this as User).password = hash;
                next();
            });
        });
    }
});
