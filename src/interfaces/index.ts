export interface IConfig {
    version: string;
    env: string;
    port: {
        emitter: number;
        listener: number;
    };
    host: string;
    database: {
        url: string;
        db: string;
        pooltime: string;
        concurrency: number
    };
    logs: {
        path: string;
        level: string
    };
    emit: {
        interval: number;
        min: number;
        max: number;
    };
    authentication: {
        protocol: string;
    };
    privacy: {
        protocol: string;
        passphrase: string;
    };
}


export interface IError {
    code: number;
    message?: string;
}


export interface IPayload {
    timestamp?: number;
    name: string;
    origin: string;
    destination: string;
    secret_key?: string;
}

