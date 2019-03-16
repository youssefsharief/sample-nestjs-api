import { Test } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../../src/users/users.module';
import { ApiCalls } from './api-calls';
import { ROLES } from '../../src/common/constants/roles-constants';
import { UsersDbTestingOperations } from './db-operations';
import { hashModule } from '../../src/common/auth/hash';
import { supertestPromise, authHeaders } from './util-test';
import * as mongoose from 'mongoose';

const manager = {
    name: 'a manger name',
    email: 'manager@test.com',
    password: '1234567aBCD',
    role: 'manager',
};
const regularUser = {
    name: 'a user name',
    email: 'user@test.com',
    password: '1234567aBCD',
    role: 'regular',
};

describe('E2E users', () => {
    let app: INestApplication;
    let api: ApiCalls;
    let usersDbTestingOperations: UsersDbTestingOperations;
    let regularUserId: string;
    let regularUserToken: string;
    let managerId: string;
    let managerToken: string;

    beforeAll(async () => {
        if (!process.env.mongodbMockURI) {
            throw Error('a');
        } else {
            const moduleFixture = await Test.createTestingModule({
                imports: [MongooseModule.forRoot(process.env.mongodbMockURI), UsersModule],
                providers: [UsersDbTestingOperations],
            }).compile();

            app = moduleFixture.createNestApplication();
            await app.init();
            api = new ApiCalls(app.getHttpServer());
            usersDbTestingOperations = moduleFixture.get(UsersDbTestingOperations);
            await usersDbTestingOperations.removeAllUsers();
            await usersDbTestingOperations.createUser(manager.name, manager.email, await hashModule.hash(manager.password), manager.role);
            await usersDbTestingOperations.createUser(
                regularUser.name,
                regularUser.email,
                await hashModule.hash(regularUser.password),
                regularUser.role,
            );
            const managerRes = await supertestPromise(() =>
                api.login({ email: manager.email, password: manager.password }).expect(HttpStatus.OK),
            );
            managerId = managerRes.body.user._id;
            managerToken = managerRes.body.token;
            const regularUserRes = await supertestPromise(() =>
                api.login({ email: regularUser.email, password: regularUser.password }).expect(HttpStatus.OK),
            );
            regularUserId = regularUserRes.body.user._id;
            regularUserToken = regularUserRes.body.token;
        }
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe('logging in', () => {
        describe('correct credentials', () => {
            it('should login ', async () => {
                const res = await supertestPromise(() =>
                    api
                        .login({
                            email: regularUser.email,
                            password: regularUser.password,
                        })
                        .expect(HttpStatus.OK),
                );
                expect(res.body.user).toBeTruthy();
                expect(res.body.user).toBeTruthy();
                expect(res.body.user.email).toBe(regularUser.email);
                expect(res.body.user.role).toBe('regular');
                expect(res.body.user.password).toBeFalsy();
                expect(res.body.user.name).toBeTruthy();
                expect(res.body.user._id).toBeTruthy();
                expect(res.body.token).toBeTruthy();
            });
        });
    });

    describe('wrong credentials', () => {
        it('should not login with wrong credentials', async () => {
            await supertestPromise(() =>
                api.login({ email: 'randomEmail@test33.com', password: '454ds65ds8ew' }).expect(HttpStatus.UNAUTHORIZED),
            );
        });
    });

    describe('protected route', () => {
        it('should not work for a regular user', async () => {
            await supertestPromise(() => api.protected(authHeaders(regularUserToken)).expect(HttpStatus.FORBIDDEN));
        });

        it('should work for a manager', async () => {
            await supertestPromise(() => api.protected(authHeaders(managerToken)).expect(HttpStatus.OK));
        });

        it('should not work if token is not supplied', async () => {
            await supertestPromise(() => api.protected('').expect(HttpStatus.FORBIDDEN));
        });

        describe('getting User details', () => {
            it('should get user details successfully as a regular user', async () => {
                const res = await supertestPromise(() =>
                    api.getUserDetails(regularUserId, authHeaders(regularUserToken)).expect(HttpStatus.OK),
                );
                expect(res).toBeTruthy();
                expect(res.body.name).toBe(regularUser.name);
                expect(res.body.role).toBe('regular');
            });
        });

        describe('upgrading role', () => {
            it('regular user could not upgrade him/herself', async () => {
                await supertestPromise(() => api.updateRole(regularUserId, authHeaders(regularUserToken)).expect(HttpStatus.FORBIDDEN));
            });

            it('manager could upgrade a regular user', async () => {
                await supertestPromise(() => api.updateRole(regularUserId, authHeaders(managerToken)).expect(HttpStatus.OK));
                const res2 = await supertestPromise(() => api.login(regularUser).expect(HttpStatus.OK));
                expect(res2.body.user.role).toBe(ROLES.manager);
            });
        });

        describe('update data', () => {
            it('regular user could update his/her own data', async () => {
                const newEmail = 'new_email@test.com';
                const newName = 'a new name';
                await supertestPromise(() =>
                    api
                        .updateUserInfo(regularUserId, authHeaders(regularUserToken), { name: newName, email: newEmail })
                        .expect(HttpStatus.OK),
                );
                const res2 = await supertestPromise(() =>
                    api.getUserDetails(regularUserId, authHeaders(regularUserToken)).expect(HttpStatus.OK),
                );
                expect(res2.body.email).toBe(newEmail);
                expect(res2.body.name).toBe(newName);
            });

            it('data validation should work', async () => {
                await supertestPromise(() =>
                    api
                        .updateUserInfo(regularUserId, authHeaders(regularUserToken), { name: 'a new name', email: 'not an email' })
                        .expect(HttpStatus.BAD_REQUEST),
                );
            });

            it('manager could update his/her own data', async () => {
                await supertestPromise(() =>
                    api
                        .updateUserInfo(managerId, authHeaders(managerToken), { name: 'a new name', email: 'a_new_manager_email@test.com' })
                        .expect(HttpStatus.OK),
                );
            });

            it("manager could not update another user's data ", async () => {
                await supertestPromise(() =>
                    api
                        .updateUserInfo(regularUserId, authHeaders(managerToken), { name: 'a new name', email: 'a_new_email.com' })
                        .expect(HttpStatus.FORBIDDEN),
                );
            });
        });
    });

    describe('signup up', () => {
        it('should not allow duplicate emails', async () => {
            await supertestPromise(() => api.signup({ ...regularUser, email: 'new_email@test.com' }).expect(HttpStatus.CONFLICT));
        });
        it('should respond by error message in case password have no letter', async () => {
            await supertestPromise(() => api.signup({ ...regularUser, password: '12236565' }).expect(HttpStatus.BAD_REQUEST));
        });

        it('should respond by error message in case password have no number', async () => {
            await supertestPromise(() => api.signup({ ...regularUser, password: 'herogymisthe' }).expect(HttpStatus.BAD_REQUEST));
        });
        it('should respond by error message in case password is not lengthy enough', async () => {
            await supertestPromise(() => api.signup({ ...regularUser, password: 'i5o' }).expect(HttpStatus.BAD_REQUEST));
        });
        it('should respond by error message in case name is not provided', async () => {
            await supertestPromise(() => api.signup({ ...regularUser, name: '' }).expect(HttpStatus.BAD_REQUEST));
        });
        it('should respond by error message in case email is not provided', async () => {
            await supertestPromise(() => api.signup({ ...regularUser, email: '' }).expect(HttpStatus.BAD_REQUEST));
        });
        it('should respond by error message in case password is not provided', async () => {
            await supertestPromise(() => api.signup({ ...regularUser, password: '' }).expect(HttpStatus.BAD_REQUEST));
        });
        it('should respond by error message in case email do not have the appropriate format', async () => {
            await supertestPromise(() => api.signup({ ...regularUser, email: 'thisIsNOTanEmail' }).expect(HttpStatus.BAD_REQUEST));
        });
    });
});
