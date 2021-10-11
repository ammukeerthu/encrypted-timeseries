import { MongoError } from 'mongodb';
const Client = require('mongodb').MongoClient;
import { Inject } from 'typedi';
import { Logger } from 'winston';

import { IConfig } from '../interfaces';


// TODO: remove type 'any'
class Mongo {

    private client: any;
    private db: any;

    constructor(
        @Inject('config') private config: IConfig,
        @Inject('logger') private logger: Logger
    ) {}

    private async testConn() {

        const url = `${this.config.database.url}/${this.config.database.db}`;

        this.logger.debug(`Establishing connection to ${url}`);

        const clientx = new Promise((resolve, reject) => {
            Client.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, (err: MongoError, client: any) => {
                if (err) {
                    reject(err);
                    return
                }
                this.logger.debug(`Connection established to database: ${this.config.database.db}`);
                resolve(client);
            });
        }).catch((err) => {
            throw err;
        });

        this.client = await clientx;

        this.db = await this.client.db();

    }

    async initConn() {

        await this.testConn();

    }

    async closeConn() {

        this.client.close();
        this.logger.debug('MongoDB connection closed');

    }

    async search(collection: string, query: object = {}, project: object = {}) {

        const collx = await this.db.collection(collection);

        if (Object.keys(project).length == 0)
            project = {_id: 0, type: 0};

        this.logger.debug(`Search query execution in collection: ${collection}`);
        this.logger.debug(`Search query - ${JSON.stringify(query)}`);

        const datax = new Promise((resolve, reject) => {
            collx.find(query, {projection: project}).toArray((err: MongoError, data: any) => {
                if (err) {
                    reject(err);
                    return
                }
                resolve(data);
            });
        }).catch((err) => {
            throw err;
        });

        const resp = await datax;

        this.logger.debug(`Search query response - ${JSON.stringify(resp)}`);

        return resp

    }

    async execBulkOps(collection: string, queries: Array<object>) {

        if (queries.length == 0) {
            return
        }

        const collx = await this.db.collection(collection);

        this.logger.debug(`Bulk query execution in collection: ${collection}`);
        this.logger.debug(`Bulk queries - ${JSON.stringify(queries)}`);

        const datax = new Promise((resolve, reject) => {
            collx.bulkWrite(queries, {ordered: false}, (err: MongoError, data: any) => {
                if (err) {
                    reject(err);
                    return
                }
                resolve(data);
            });
        }).catch((err) => {
            throw err;
        });

        const resp = await datax;

        this.logger.debug(`Bulk query response - ${JSON.stringify(resp)}`);

        return resp

    }

    async execAggrOp(collection: string, pipeline: Array<object>, options: any = {}) {

        const collx = await this.db.collection(collection);

        options.allowDiskUse = true;

        this.logger.debug(`Aggregation query execution in collection: ${collection}`);
        this.logger.debug(`Aggregation pipeline - ${JSON.stringify(pipeline)}`);
        this.logger.debug(`Aggregation options - ${JSON.stringify(options)}`);

        const datax = new Promise((resolve, reject) => {
            collx.aggregate(pipeline, options).toArray((err: MongoError, data: any) => {
                if (err) {
                    reject(err);
                    return
                }
                resolve(data);
            });
        }).catch((err) => {
            throw err;
        });

        const resp = await datax;

        this.logger.debug(`Aggregation query response - ${JSON.stringify(resp)}`);

        return resp

    }

    createInsertOp(data: object) {

        const query = {
            insertOne: {
                document: data
            }
        }

        return query

    }

    async createOne(collection: string, data: object) {

        const query = this.createInsertOp(data);

        const resp = await this.execBulkOps(collection, [query]);

        return resp

    }

    createUpdateOp(match: object, data: object, insert: boolean = false, multi: boolean = false) {

        if (multi) {
            const query = {
                updateMany: {
                    filter: match,
                    update: data,
                    upsert: insert
                }
            }
            return query
        } else {
            const query = {
                updateOne: {
                    filter: match,
                    update: data,
                    upsert: insert
                }
            }
            return query
        }

    }

    async updateOne(collection: string, match: object, data: object, insert: boolean = false) {

        const query = this.createUpdateOp(match, data, insert);

        const resp = await this.execBulkOps(collection, [query]);

        return resp

    }

    async updateMany(collection: string, match: object, data: object, insert: boolean = false) {

        const query = this.createUpdateOp(match, data, insert, true);

        const resp = await this.execBulkOps(collection, [query]);

        return resp

    }

}


export default async (cfg: IConfig, logger: Logger): Promise<Mongo> => {

    const mongo = new Mongo(cfg, logger);
    await mongo.initConn();

    return mongo

}

