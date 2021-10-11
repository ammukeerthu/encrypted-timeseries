import * as path from 'path';
import { createServer } from 'http';

import 'reflect-metadata';
import express from 'express';
import { Request, Response } from 'express';
import { Container } from 'typedi';
import { Server } from 'socket.io';

import config from './config';
import logger from './loaders/logger';
import EmitterService from './services/emitter';


async function startServer() {

    const app = express();

    const httpserver = createServer(app);

    app.get(`/`, (_req: Request, res: Response) => {
        res.sendFile(path.resolve('./src/index.html'));
    });

    const LISTENER = require('socket.io-client')('http://192.168.12.136:3001');
    LISTENER.on('connect', () => {
        Container.set('listener', LISTENER);
        logger.debug('Listener object injected into container');
        LISTENER.on('test', (message: string) => {
            // a message received from listener
            // send message to lobby room
            io.to('lobby').emit('message', message);
        });
    });

    const io = new Server(httpserver, {
        /* ... */
        allowEIO3: true,
        cors: {
            // origin: `http://192.168.12.136`,
            origin: `http://${config.host}`,
            methods: ['GET'],
            credentials: true,
        }
    });
    io.on('connection', (socket: any) => {

        logger.debug(`Socket ID: ${socket.id}`);
        logger.debug(`Connections: ${JSON.stringify(Object.keys(socket.server.eio.clients))}`);

        socket.emit('servertest', 'Hello Listener!');

        socket.on('servertest', (message: string) => {
            logger.info(`test message from listener - ${message}`);
        });

        // connect to lobby room
        socket.join('lobby');

        Container.set('socket', socket);
        logger.debug('Socket object injected into container');

        socket.on('disconnect', (reason: any) => {
            if (reason === 'io server disconnect') {
                // the disconnection was initiated by the server, you need to reconnect manually
                socket.connect();
            }
            // else the socket will automatically try to reconnect
            logger.info('socket disconnection');
        });

        socket.on('reconnect', (attemptNumber: number) => {
            logger.info(`socket reconnection - attempt ${attemptNumber}`);
        });

        socket.on('test', (message: string) => {
            logger.info(`test message from client - ${message}`);
        });

    });

    Container.set('config', config);
    logger.debug('Config injected into container');

    Container.set('logger', logger);
    logger.debug('Logger injected into container');

    httpserver.listen(config.port.emitter, config.host, () => {
        logger.info(`
            ####################################
                Emitter running on port: ${config.port.emitter}
            ####################################
        `);
    }).on('error', (err) => {
        logger.error(err);
        process.exit(1);
    });

    const emittersrv = Container.get(EmitterService);
    await emittersrv.Start();
}

startServer();
