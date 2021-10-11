import Container, { Service, Inject } from 'typedi';
import { Logger } from 'winston';
import jsonfile from 'jsonfile';
import sha256 from 'sha256';
import CryptoJS from 'crypto-js';

import { getCurTimestamp, getRandomInt } from '../helpers/utils';
import { IConfig, IPayload } from '../interfaces';
import CustomError from '../loaders/error';


const input = jsonfile.readFileSync('./dataset/data.json');


@Service()
export default class EmitterService {

    constructor(
        @Inject('config') private config: IConfig,
        @Inject('logger') private logger: Logger
    ) {}

    private Combinate<O extends Record<string | number, any[]>>(obj: O) {

        let combos: { [k in keyof O]: O[k][number] }[] = [];

        for (const key of Object.keys(obj)) {

            const values = obj[key];
            const all = [];

            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < values.length; i++) {
                for (let j = 0; j < (combos.length || 1); j++) {
                    if (key == 'destination' && combos[j]?.origin != undefined && combos[j].origin == values[i]) {
                        continue
                    }
                    const newCombo = { ...combos[j], [key]: values[i] };
                    all.push(newCombo);
                }
            }

            combos = all;

        }

        return combos

    }

    private Emit(payload: Array<IPayload>) {

        this.logger.debug(`Initiate emitting of data`);

        let count = getRandomInt(this.config.emit.min, this.config.emit.max);

        const batch = [];
        let encpayload = '';

        const ct = getCurTimestamp();
        while (count--) {
            const item: IPayload = payload.splice(Math.floor(Math.random() * payload.length), 1)[0];
            item.timestamp = ct;
            item.secret_key = sha256(JSON.stringify(item));
            const encrypted = CryptoJS.AES.encrypt(JSON.stringify(item), this.config.privacy.passphrase).toString();
            batch.push(item);
            encpayload += encrypted + '|';
        }

        this.logger.debug(`Randomized encrypted payload count: ${batch.length}`);

        this.logger.debug(`Sending payload via socket to listener`);

        let socket: any;
        try {
            socket = Container.get('listener'); // connecting to listener
        } catch (err) {
            this.logger.error('Listener connection is yet not opened');
            throw new CustomError(200, 'Listener connection is yet not opened');
        }

        socket.emit('payload', encpayload);

        this.logger.info(`Sent payload via socket`);

    }

    async Start() {

        const dataset = {
            name: input.names,
            origin: input.cities,
            destination: input.cities
        };

        const output = this.Combinate(dataset);

        setInterval(async () => {

            try {
                this.Emit(output);
            } catch (e) {
                // do nothing
            }

        }, this.config.emit.interval * 1000);

    }

}

