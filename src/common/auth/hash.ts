import * as bcrypt from 'bcryptjs';
const SALT_WORK_FACTOR = 10;

export const hashModule = {
    isPasswordRight(toBeExaminedPassword: string, realPassword: string) {
        return bcrypt.compare(toBeExaminedPassword, realPassword);
    },

    hash(password: string) {
        return bcrypt.hash(password, SALT_WORK_FACTOR);
    },
};
