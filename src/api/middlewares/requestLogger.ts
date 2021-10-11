import { Request, Response, NextFunction } from 'express';

import logger from '../../loaders/logger';


const requestLogger = (req: Request, res: Response, next: NextFunction) => {

    logger.debug(`${req.ip}: ${req.method} ${req.originalUrl} Params: ${JSON.stringify(req.params)} Body: ${JSON.stringify(req.body)}`);

    res.on('finish', () => {
        logger.info(`${req.method} ${req.originalUrl} - Response: ${res.statusCode}`);
    });

    next();

}


export default requestLogger;

