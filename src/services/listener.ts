import { Service, Inject } from 'typedi';
import { Container, Logger } from 'winston';
import sha256 from 'sha256';
import CryptoJS from 'crypto-js';

import { IConfig, IPayload, IResult } from '../interfaces';
import CustomError from '../loaders/error';
import { getCurTimestamp } from '../helpers/utils';
import General from '../models';


@Service()
export default class ListenerService {

    constructor(
        @Inject('config') private config: IConfig,
        @Inject('general') private general: General,
        @Inject('logger') private logger: Logger
    ) {}

    async Validate(payload: string) {

        this.logger.debug(`Data integrity validation initiated`);

        const timestamp = getCurTimestamp();
        let validCount = 0;
        let invalidCount = 0;

        const output: Array<IPayload> = [];

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
                this.logger.info(`Valid message: ${JSON.stringify(item)}`);
                validCount += 1;
                output.push(item);
            }

        }

        const result: IResult = {
            timestamp,
            messages: {
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
            this.logger.error('Client connection is yet not opened');
            throw new CustomError(200, 'Client connection is yet not opened');
        }

        socket.emit('result', result);

        this.logger.debug(`Updating data to DB`);

        await this.general.pushPayload(output);
        await this.general.pushResult(result);

        this.logger.info(`Updated data to DB`);

        return result

    }

}

