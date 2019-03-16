import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ROLES } from '../constants/roles-constants';

@Injectable()
export class AllowOnlyManagersGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        return validateRequest(request);
    }
}

async function validateRequest(req: any) {
    return req.decoded.role === ROLES.manager;
}
