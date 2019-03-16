import { hashModule } from '../../src/common/auth/hash';

describe('utility service', () => {
    let hash: string;
    describe('hash', () => {
        beforeAll(async () => {
            hash = await hashModule.hash('aa');
        });
        it('should get a long hash', async () => {
            expect(hash.length).toBeGreaterThan(10);
        });

        describe('comparing password', () => {
            it('should work with right password', async () => {
                const isRight = await hashModule.isPasswordRight('aa', hash);
                expect(isRight).toBeTruthy();
            });

            it('should not work with wrong password', async () => {
                const isRight = await hashModule.isPasswordRight('wrong', hash);
                expect(isRight).toBeFalsy();
            });
        });
    });
});
