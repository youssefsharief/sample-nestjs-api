import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { jwtModule } from '../auth/jwt';

@Injectable()
export class AllowValidAuthTokenGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        return validateRequest(request);
    }
}

const doesTokenExist = (authorization: any) => authorization && authorization.split(' ')[0] === 'Bearer';

async function validateRequest(req: any) {
    if (!doesTokenExist(req.headers.authorization)) {
        return false;
    } else {
        const token = req.headers.authorization.split(' ')[1];
        try {
            const decoded = await jwtModule.verify(token);
            req.decoded = decoded;
            return true;
        } catch (e) {
            return false;
        }
    }
}
