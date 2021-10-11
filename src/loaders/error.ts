export default class CustomError extends Error {

    code: number;
    message: string;

    constructor(code: number|string, message: string, component?: string) {

        let msgx;
        if (code == 'ECONNREFUSED') {
            code = 200;
            msgx = `Connection refused to ${component.toLowerCase( )}`;
        } else if (code == 'ECONNRESET') {
            code = 200;
            msgx = `Connection reset to ${component.toLowerCase( )}`;
        } else if (code == 'ECONNABORTED') {
            code = 200;
            msgx = `Connection aborted to ${component.toLowerCase( )}`;
        } else if (code == 'EHOSTUNREACH') {
            code = 200;
            msgx = `${component} unreachable`;
        } else if (code == 'RequestTimedOutError') {
            code = 200;
            msgx = message;
        } else if (code == 'ENOTFOUND') {
            code = 200;
            msgx = (component != undefined) ? `Invalid hostname: '${component}'` : `Invalid hostname`;
        } else {
            msgx = message;
        }
        super(msgx);

        this.code = code as number || 500;

    }

}

