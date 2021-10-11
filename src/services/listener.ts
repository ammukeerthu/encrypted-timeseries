import { Service, Inject } from 'typedi';
import { Container, Logger } from 'winston';
import sha256 from 'sha256';
import CryptoJS from 'crypto-js';

import { IConfig } from '../interfaces';
import CustomError from '../loaders/error';
import { getCurTimestamp } from '../helpers/utils';


@Service()
export default class ListenerService {

    constructor(
        @Inject('config') private config: IConfig,
        @Inject('logger') private logger: Logger
    ) {}

    Validate(payload: string) {

        this.logger.debug(`Data integrity validation initiated`);

        const timestamp = getCurTimestamp();
        let validCount = 0;
        let invalidCount = 0;

        const ENCDATA = payload.split('|').filter(item => item);

        for (const d of ENCDATA) {

            this.logger.debug(`Decrypting message: ${d}`);

            const bytes = CryptoJS.AES.decrypt(d, this.config.privacy.passphrase);

            let item;
            try {
                item = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            } catch (e) {
                this.logger.error(`Malformed message: ${d}`);
                invalidCount += 1;
                continue
            }

            this.logger.debug(`Validating data integrity of message: ${JSON.stringify(item)}`);

            const SECRETKEY = item.secret_key;
            Reflect.deleteProperty(item, 'secret_key');

            const CNFSECRETKEY = sha256(JSON.stringify(item));

            if (SECRETKEY != CNFSECRETKEY) {
                this.logger.debug(`Valid secret key: ${CNFSECRETKEY}`);
                this.logger.error(`Corrupted message:  ${JSON.stringify(item)}`);
                invalidCount += 1;
            } else {
                this.logger.info(`Valid message: ${item}`);
                validCount += 1;
            }

        }

        const result = {
            timestamp,
            message: {
                valid: validCount,
                invalid: invalidCount
            }
        }

        this.logger.debug(`Data integrity validation completed successfully`);

        this.logger.debug(`Sending result via socket to client`);

        let socket: any;
        try {
            socket = Container.get('socket');
        } catch (err) {
            this.logger.error('Socket connection is yet not opened');
            throw new CustomError(200, 'Socket connection is yet not opened');
        }

        socket.emit('result', result);

        return result

    }

}

