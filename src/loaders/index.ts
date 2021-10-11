import { Container } from 'typedi';
import { Application } from 'express';
import { Logger } from 'winston';

import expressLoader from './express';
import mongoLoader from './mongo';
import General from '../models';
import { IConfig } from '../interfaces';


export default async (expressApp: Application, cfg: IConfig, logger: Logger) => {

    Container.set('config', cfg);
    logger.debug('Config injected into container');

    Container.set('logger', logger);
    logger.debug('Logger injected into container');

    // TODO: remove type 'any'
    let mongoConnection: any;
    try {
        mongoConnection = await mongoLoader(cfg, logger);
    } catch (err) {
        logger.error(`Failed to establish connection with DB - ${err.message}`);
        process.exit(1);
    }
    logger.debug('DB loaded and connected!');

    Container.set('mongo', mongoConnection);
    logger.debug('Mongo injected into container');

    const models = [];

    models.push(
        {name: 'generalModel', model: new General()}
    )

    models.forEach(m => {
        Container.set(m.name, m.model);
        logger.debug(`Model ${m.name} injected into container`);
    });

    // await licenseChecker();

    expressLoader(expressApp, logger);
    logger.debug('Server loaded');

}

