import { Injectable, NestMiddleware, MiddlewareFunction } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    resolve(context: string): MiddlewareFunction {
        return (req, res, next) => {
            console.log(`[${req.method}] [${req.baseUrl}] Request`);
            // tslint:disable-next-line: no-non-null-assertion
            next!();
        };
    }
}
