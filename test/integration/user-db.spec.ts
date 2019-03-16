import * as faker from 'faker';
import { UsersDb } from '../../src/users/users.db';
import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, User } from '../../src/users/schemas/user.schema';
import { UsersDbTestingOperations } from './db-operations';
import * as mongoose from 'mongoose';

const regularUser = {
    name: 'a user name',
    email: 'user3@test.com',
    password: '1234567a',
    role: 'regular',
};

describe('users db', () => {
    let usersDb: UsersDb;
    let usersDbTestingOperations: UsersDbTestingOperations;
    let regularUserId: string;

    beforeAll(async () => {
        if (!process.env.mongodbMockURI) {
            throw Error('mongodbMockURI not provided');
        } else {
            const moduleFixture = await Test.createTestingModule({
                imports: [
                    MongooseModule.forRoot(process.env.mongodbMockURI),
                    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
                ],
                providers: [UsersDb, UsersDbTestingOperations],
            }).compile();
            usersDb = moduleFixture.get(UsersDb);
            usersDbTestingOperations = moduleFixture.get(UsersDbTestingOperations);
            await usersDbTestingOperations.removeAllUsers();
            const res = await usersDbTestingOperations.createUser(
                regularUser.name,
                regularUser.email,
                regularUser.password,
                regularUser.role,
            );
            regularUserId = res._id;
        }
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe('crud', () => {
        it('should GET user info by email ', async () => {
            const x = await usersDb.getUserByEmail(regularUser.email);
            if (!x) {
                throw Error('not getting by email');
            } else {
                expect(x.name).toBe(regularUser.name);
                expect(x.email).toBe(regularUser.email);
            }
        });

        it('should GET user info by id ', async () => {
            const x = await usersDb.getUserById(regularUserId);
            if (!x) {
                throw Error('not getting by id');
            } else {
                expect(x.name).toBe(regularUser.name);
                expect(x.email).toBe(regularUser.email);
            }
        });

        it('should be able to update role to manager ', async () => {
            const x = await usersDb.updateRole(regularUserId, 'manager');
            if (!x) {
                throw Error('not updating');
            } else {
                expect(x.role).toBe('manager');
            }
        });

        describe('updating user info', () => {
            const newName = 'a new name';
            const newEmail = faker.internet.email();
            let updatedUser: User;
            beforeAll(async () => {
                const res = await usersDb.updateUserInfo(regularUserId, newName, newEmail);
                if (!res) {
                    throw Error('not updating info');
                } else {
                    updatedUser = res;
                }
            });
            it('should update successfully', async () => {
                expect(updatedUser.name).toBe(newName);
                expect(updatedUser.email).toBe(newEmail);
            });
        });
    });
});
