import { logger } from '../../src/infrastructure/logger';
import * as supertest from 'supertest';

export const supertestPromise = (fn: () => supertest.Test): Promise<supertest.Response> => {
    return new Promise((resolve, reject) => {
        fn().end((err, res) => {
            if (err) {
                logger.error('%j', res.body);
                throw err;
            } else {
                resolve(res);
            }
        });
    });
};

export const authHeaders = (token: string) => `Bearer ${token}`;
