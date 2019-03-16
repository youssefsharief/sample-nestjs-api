import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AllowOnlyMyselfGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        return validateRequest(request);
    }
}

async function validateRequest(req: any) {
    if (req.decoded._id === req.params.id) {
        return true;
    } else {
        return false;
    }
}
