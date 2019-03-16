import { LoginDto } from '../../src/users/dto/login.dto';
import { SignupDto } from '../../src/users/dto/signup.dto';
import * as request from 'supertest';

export class ApiCalls {
    private readonly r: request.SuperTest<request.Test>;

    constructor(obj: request.SuperTest<request.Test>) {
        this.r = request(obj);
    }

    login(payload: LoginDto) {
        return this.r.post('/api/users/login').send(payload);
    }

    signup(payload: SignupDto) {
        return this.r.post('/api/users').send(payload);
    }

    protected(token: string) {
        return this.r.get('/api/users/protected').set({ Authorization: token });
    }

    updateUserInfo(id: string, token: string, payload: { name: string; email: string }) {
        return this.r
            .put(`/api/users/${id}/info`)
            .set({ Authorization: token })
            .send(payload);
    }

    getUserDetails(id: string, token: string) {
        return this.r.get(`/api/users/${id}/info`).set({ Authorization: token });
    }

    updateRole(userId: string, token: string) {
        return this.r.patch(`/api/users/${userId}/upgradeRole`).set({ Authorization: token });
    }
}
