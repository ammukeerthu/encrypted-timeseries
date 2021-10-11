import { Container } from 'typedi';

import { getCurTimestamp } from '../helpers/utils';
import { IPayload } from '../interfaces';

export default class General {

    private collection = 'events';
    // TODO: remove type 'any'
    private mongo: any;

    constructor() {

        this.mongo = Container.get('mongo');

    }

    async push(payload: Array<IPayload>) {

        const queries = [];
        for (const p of payload) {
            const match = {
                timestamp: getCurTimestamp()
            };
            const data = {
                $push: {
                    events: p
                }
            };
            queries.push(await this.mongo.createUpdateOp(match, data, true));
        }

        await this.mongo.execBulkOps(this.collection, queries);

    }

}

