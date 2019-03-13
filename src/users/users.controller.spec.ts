import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('AppController', () => {
    let app: TestingModule;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [UsersService],
        }).compile();
    });

    describe('getHello', () => {
        it('should return "Hello World!"', () => {
            const usersController = app.get(UsersController);
            expect(usersController.getHello()).toBe('Hello World!');
        });
    });
});
