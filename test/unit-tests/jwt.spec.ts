import { jwtModule } from '../../src/common/auth/jwt';

describe('jwtModule', () => {
    let token: string;
    beforeAll(() => {
        token = jwtModule.sign('a', 'regular');
    });
    describe('sign', () => {
        it('should get token', () => {
            expect(typeof token).toBe('string');
            expect(token.length).toBeGreaterThan(50);
        });
    });

    describe('verify', () => {
        describe('valid token', () => {
            let decoded: { _id: string; role: string };
            beforeAll(async () => {
                decoded = (await jwtModule.verify(token)) as { _id: string; role: string };
            });

            it('should verify signed token', async () => {
                expect(decoded).toBeTruthy();
            });

            it('should return user properties', async () => {
                expect(decoded._id).toBe('a');
                expect(decoded.role).toBe('regular');
            });
        });

        describe('unvalid token', () => {
            it('should throw an error', async () => {
                try {
                    await jwtModule.verify('ey34783_unreal_token');
                } catch (e) {
                    expect(e).toBeTruthy();
                }
            });
        });
    });
});
