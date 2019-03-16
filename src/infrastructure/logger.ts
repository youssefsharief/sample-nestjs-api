import * as winston from 'winston';
const { transports, createLogger, format } = winston;

const l = createLogger({
    level: 'info',
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log' }),
    ],
    format: format.combine(format.timestamp(), format.splat(), format.simple()),
});

if (process.env.NODE_ENV !== 'production') {
    l.add(
        new transports.Console({
            format: format.combine(format.splat(), format.colorize(), format.simple()),
        }),
    );
}

export const logger = l;
