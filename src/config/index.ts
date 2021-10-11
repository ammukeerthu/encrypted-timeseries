import * as dotenv from 'dotenv';


const cfg = dotenv.config();


if (cfg.error) {
    // throw new Error('Couldn\'t find .env file');
    // tslint:disable-next-line: no-console
    console.warn('No .env file specified');
}


export default {

    version: '1.0.0-1',

    env: process.env.NODE_ENV || 'prod',

    port: {
        emitter: parseInt(process.env.EMITTER || '3000', 10),
        listener: parseInt(process.env.LISTENER || '3001', 10)
    },

    host: process.env.HOST || '0.0.0.0',

    database: {
        url: process.env.DATABASE_URL || 'mongodb://localhost',
        db: process.env.DATABASE || 'syook',
        pooltime: '30 seconds',
        concurrency: 10
    },

    logs: {
        path: 'logs/',
        level: process.env.LOG_LEVEL || 'info'
    },

    emit: {
        interval: parseInt(process.env.INTERVAL || '10' , 10),
        min: parseInt(process.env.MIN_EMIT || '49' , 10),
        max: parseInt(process.env.MAX_EMIT || '499' , 10)
    },

    authentication: {
        protocol: 'sha256' // sha256|md5
    },

    privacy: {
        protocol: 'aes', // aes|des
        passphrase: 'testing'
    }

}
