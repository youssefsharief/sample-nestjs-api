import { Injectable, NestInterceptor, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class DurationLoggerInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, call$: Observable<any>): Observable<any> {
        const now = Date.now();
        return call$.pipe(tap(() => console.log(`Request took ${Date.now() - now}ms`)));
    }
}
