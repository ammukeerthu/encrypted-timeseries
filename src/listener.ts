import * as path from 'path';
import { createServer } from 'http';

import 'reflect-metadata';
import express from 'express';
import { Request, Response } from 'express';
import { Container } from 'typedi';
import { Server } from 'socket.io';

import config from './config';
import logger from './loaders/logger';
import ListenerService from './services/listener';


async function startServer() {

    const app = express();

    const httpserver = createServer(app);

    app.get(`/`, (_req: Request, res: Response) => {
        res.sendFile(path.resolve('./src/templates/index.html'));
    });

    const io = new Server(httpserver, {
        /* ... */
        allowEIO3: true,
        cors: {
            origin: `http://${config.host}`,
            methods: ['GET'],
            credentials: true,
        }
    });
    io.on('connection', (socket: any) => {

        socket.emit('clienttest', 'Hello Client!');

        socket.on('clienttest', (message: string) => {
            logger.info(`test message from client - ${message}`);
        });

        socket.emit('servertest', 'Hello Emitter!');

        socket.on('servertest', (message: string) => {
            logger.info(`test message from emitter - ${message}`);
        });

        socket.on('payload', (payload: string) => {
            logger.info(`sending payload to listener`);
            const listenersrv = Container.get(ListenerService);
            try {
                listenersrv.Validate(payload);
            } catch (e) {
                // do nothing
            }
        });

    });

    await require('./loaders').default(app, config, logger);

    httpserver.listen(config.port.listener, config.host, () => {
        logger.info(`
            ####################################
                Listener running on port: ${config.port.listener}
            ####################################
        `);
    }).on('error', (err) => {
        logger.error(err);
        process.exit(1);
    });

}

startServer();
