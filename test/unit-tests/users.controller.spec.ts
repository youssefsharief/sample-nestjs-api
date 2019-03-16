import { Test } from '@nestjs/testing';
import { UsersController } from '../../src/users/users.controller';
import { UsersDb } from '../../src/users/users.db';
import { User } from '../../src/users/schemas/user.schema';
import { hashModule } from '../../src/common/auth/hash';
import { HttpStatus } from '@nestjs/common';

describe('AppController', () => {
    let usersDb: UsersDb;
    let usersController: UsersController;

    beforeEach(async () => {
        const moduleFixture = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [{ provide: UsersDb, useValue: {} }],
        }).compile();

        usersDb = moduleFixture.get(UsersDb);
        usersController = moduleFixture.get(UsersController);
    });

    describe('upgrade role', () => {
        describe('user do not exist', () => {
            it('should return a NotFound Excpetion', async () => {
                try {
                    usersDb.updateRole = jest.fn(() => Promise.resolve(null));
                    await usersController.upgradeRole({ id: '1' });
                } catch (e) {
                    expect(e.message.statusCode).toBe(HttpStatus.NOT_FOUND);
                }
            });
        });

        describe('user exist', () => {
            it('shouldreturn success response', async () => {
                usersDb.updateRole = jest.fn(() =>
                    Promise.resolve({
                        _id: '1',
                        name: 'a cool name',
                        role: 'user',
                        password: 'a password43',
                        email: 'aa@test.com',
                    } as User),
                );
                const updated = await usersController.upgradeRole({ id: '1' });
                expect(updated).toBeTruthy();
            });
        });
    });

    describe('update user info', () => {
        describe('user do not exist', () => {
            it('should return a NotFound Excpetion', async () => {
                try {
                    usersDb.updateUserInfo = jest.fn(() => Promise.resolve(null));
                    await usersController.updateUserInfo({ id: '1' }, { email: 'aa@test.com', name: 'a cool name' });
                } catch (e) {
                    expect(e.message.statusCode).toBe(HttpStatus.NOT_FOUND);
                }
            });
        });

        describe('user exist', () => {
            it('should return token with updated props', async () => {
                usersDb.updateUserInfo = jest.fn(() =>
                    Promise.resolve({
                        _id: '1',
                        name: 'a cool name',
                        role: 'user',
                        password: 'a password43',
                        email: 'aa@test.com',
                    } as User),
                );
                const updated = await usersController.updateUserInfo({ id: '1' }, { email: 'aa@test.com', name: 'a cool name' });
                expect(updated).toBeTruthy();
            });
        });
    });

    describe('signup', () => {
        it('should return token and user object with role, name, and email', async () => {
            usersDb.createUser = jest.fn(() =>
                Promise.resolve({
                    _id: '1',
                    name: 'a cool name',
                    role: 'user',
                    password: 'a password43',
                    email: 'aa@test.com',
                } as User),
            );
            const userDetails = await usersController.signup({ email: 'aa@test.com', password: 'rety', name: 'a cool name' });
            expect(userDetails.token).toBeTruthy();
            expect(userDetails.user).toMatchSnapshot();
        });
    });

    describe('login', () => {
        describe('correct credentials', () => {
            it('should return token and user object with role, name, and email', async () => {
                const hashedPassword = await hashModule.hash('rety');
                usersDb.getUserByEmail = jest.fn(() =>
                    Promise.resolve({
                        _id: '1',
                        name: 'a name',
                        role: 'user',
                        password: hashedPassword,
                        email: 'aa@test.com',
                    } as User),
                );
                const userDetails = await usersController.login({ email: 'aa@test.com', password: 'rety' });
                expect(userDetails.token).toBeTruthy();
                expect(userDetails.user).toMatchSnapshot();
            });
        });

        describe('wrong credentials', () => {
            it('should throw unauthorized exception', async () => {
                usersDb.getUserByEmail = jest.fn(() =>
                    Promise.resolve({
                        _id: '1',
                        name: 'a name',
                        role: 'user',
                        password: 'pass',
                        email: 'aa@test.com',
                    } as User),
                );
                try {
                    await usersController.login({ email: 'aa@test.com', password: 'wrong pass' });
                } catch (e) {
                    expect(e.message.statusCode).toBe(HttpStatus.UNAUTHORIZED);
                    expect(e.message).toMatchSnapshot();
                }
            });
        });

        describe('user does not exist', () => {
            it('should throw unauthorized exception without letting the user know that the user do not exist', async () => {
                usersDb.getUserByEmail = jest.fn(() => Promise.resolve(null));
                try {
                    await usersController.login({ email: 'aa@test.com', password: 'any pass' });
                } catch (e) {
                    expect(e.message.statusCode).toBe(HttpStatus.UNAUTHORIZED);
                    expect(e.message).toMatchSnapshot();
                }
            });
        });
    });

    describe('getUserInfo', () => {
        it('should return userInfo without password', async () => {
            usersDb.getUserById = jest.fn(() =>
                Promise.resolve({ name: 'A clear name', _id: 'as454g', role: 'manager', password: 'a' } as User),
            );
            const actual = await usersController.getUserInfo({ id: 'as454g' });
            expect(actual).toMatchSnapshot();
        });

        describe('user does not exist', () => {
            it('should return 404', async () => {
                usersDb.getUserById = jest.fn(() => Promise.resolve(null));
                try {
                    await usersController.getUserInfo({ id: 'as454g' });
                } catch (e) {
                    expect(e.message.statusCode).toBe(HttpStatus.NOT_FOUND);
                    expect(e.message).toMatchSnapshot();
                }
            });
        });
    });

    describe('protected', () => {
        it('should return', async () => {
            const val = await usersController.protected();
            expect(val).toBeTruthy();
        });
    });
});
