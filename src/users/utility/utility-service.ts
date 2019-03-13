import * as bcrypt from 'bcrypt';

export const comparePassword = (toBeExaminedPassword: string, realPassword: string) =>
    new Promise((res, rej) => bcrypt.compare(toBeExaminedPassword, realPassword, (err, isMatch) => (err ? rej(err) : res(isMatch))));

export const clearUnneededData = (item: { password: string }) => {
    item.password = undefined;
    return item;
};
