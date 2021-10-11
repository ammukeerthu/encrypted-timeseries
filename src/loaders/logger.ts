import { createLogger, transports, config, format } from 'winston';
import conf from '../config';


const transportsx = [];
if (conf.env == 'dev') {
    transportsx.push(
        new transports.Console({
            format: format.combine(
                format.cli(),
                format.splat()
            )
        })
    )
} else {
    const levelx = conf.logs.level;
    transportsx.push(
        new transports.File({filename: `${conf.logs.path}/error.log`, level: 'error'})
    )
    transportsx.push(
        new transports.File({filename: `${conf.logs.path}/syook.log`, level: levelx})
    )
}


const Logger = createLogger({

    level: conf.logs.level,
    levels: config.npm.levels,
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.align(),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: transportsx

});


export default Logger;

