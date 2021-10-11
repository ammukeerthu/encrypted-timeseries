import { Container } from 'typedi';

import { IPayload, IResult } from '../interfaces';

export default class General {

    // TODO: remove type 'any'
    private mongo: any;

    constructor() {

        this.mongo = Container.get('mongo');

    }

    async pushPayload(payload: Array<IPayload>) {

        const queries = [];

        for (const p of payload) {

            // fetching precise minute timestamp
            const t = p.timestamp - (p.timestamp % 60);

            const match = {
                timestamp: t
            };

            const data = {
                $push: {
                    messages: p
                }
            };

            queries.push(await this.mongo.createUpdateOp(match, data, true));

        }

        await this.mongo.execBulkOps('messages', queries);

    }

    async pushResult(result: IResult) {

        // fetching precise minute timestamp
        const t = result.timestamp - (result.timestamp % 60);

        const match = {
            timestamp: t
        };

        const data = {
            $push: {
                results: result
            }
        };

        await this.mongo.updateOne('result', match, data, true);

    }

}

