import cors from 'cors';
import bodyParser from 'body-parser';
import { Application, Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';

import middlewares from '../api/middlewares';
import { IError } from '../interfaces';
import CustomError from './error';


export default (app: Application, logger: Logger) => {

    // Enable Cross Origin Resource Sharing to all origins by default
    app.use(cors());

    // Middleware that transforms the raw string of req.body into json
    app.use(bodyParser.json({
        limit: '1gb'
    }));

    // Middleware that logs all request and response
    app.use(middlewares.requestLogger);

    // catch 404 and forward to error handler
    app.use((req: Request, _res: Response, next: NextFunction) => {
        const err: IError = new CustomError(404, `API Not Found: ${req.method} ${req.originalUrl}`);
        next(err);
    });

    // error handlers
    app.use((err: IError, _req: Request, res: Response, _next: NextFunction) => {
        logger.error('Error: %o', err);
        let code = err.code || 200;
        let msg = err.message;
        if (code.toString() == 'ERR_ASSERTION') {
            const e = msg.split(', ');
            code = parseInt(e[0], 10);
            msg = e[1];
        }
        if (msg) {
            res.status(code);
            res.json({
                error: {
                    message: msg,
                },
            });
        } else {
            res.status(code).end();
        }
    });

}

