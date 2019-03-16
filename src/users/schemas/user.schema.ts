import * as mongoose from 'mongoose';
import { ROLES } from '../../common/constants/roles-constants';

const roles_enum = {
    values: [ROLES.regular, ROLES.manager],
    message: '`{VALUE}` is not a valid user role.',
};

export interface User extends mongoose.Document {
    readonly name: string;
    readonly email: string;
    readonly role: string;
    password: string;
}

export const UserSchema = new mongoose.Schema<User>({
    name: { type: String, required: true },
    email: { type: String, required: false, trim: true, index: true, unique: true, sparse: true },
    password: { type: String, required: false },
    role: { type: String, enum: roles_enum, required: true, default: 'regular' },
});
