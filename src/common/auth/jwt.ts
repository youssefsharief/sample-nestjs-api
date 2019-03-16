import * as jwt from 'jsonwebtoken';
const secret = process.env.secret as string;

export const jwtModule = {
    verify(token: string) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, secret, (err, decoded) => {
                if (err) {
                    return reject(err);
                } else {
                    resolve(decoded);
                }
            });
        });
    },

    sign(_id: string, role: string) {
        return jwt.sign(
            {
                _id,
                role,
            },
            secret,
            {
                expiresIn: 60 * 60 * 24 * 7,
            },
        );
    },
};
