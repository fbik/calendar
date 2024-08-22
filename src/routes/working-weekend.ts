import {FastifyInstance, FastifyPluginOptions} from 'fastify';
import {CustomDate} from "../types";

export interface ListRequest {
}


export interface ListResponse {
    200: { dates: CustomDate[] };
    '4xx': { error: string };
    '5xx': { error: string };
}

export type AddRequest = CustomDate

export interface AddResponse {
    200: { success: boolean };
    '4xx': { error: string };
    '5xx': { error: string };
}

export type DeleteRequest = CustomDate;

export interface DeleteResponse {
    200: { success: boolean };
    '4xx': { error: string };
    '5xx': { error: string };
}


const workingWeekendRoutes = (instance: FastifyInstance, opts: FastifyPluginOptions, done: () => void) => {
    instance.get<{
        Body: ListRequest,
        Reply: ListResponse
    }>('/list', (request, reply) => {
        instance.pg.query<CustomDate>(
            'SELECT * FROM working_weekend', [],
            (err, result) => {
                if (err) {
                    reply.code(500).send({error: err.message})
                }
                reply.code(200).send({dates: result.rows});
            })
    })

    instance.put<{
        Body: AddRequest,
        Reply: AddResponse
    }>('/add', (request, reply) => {
        const date = request.body;
        instance.pg.query(
            'INSERT INTO working_weekend values ($1, $2, $3)', [date.day, date.month, date.year],
            err => {
                if (err) {
                    reply.code(500).send({error: err.message})
                }
                reply.code(200).send({success: true});
            })
    })

    instance.delete<{
        Body: DeleteRequest,
        Reply: DeleteResponse
    }>('/delete', (request, reply) => {
        const date = request.body;
        instance.pg.query(
            'DELETE FROM working_weekend WHERE day = $1 AND month = $2 AND year = $3', [date.day, date.month, date.year],
            err => {
                if (err) {
                    reply.code(500).send({error: err.message})
                }
                reply.code(200).send({success: true});
            })

        reply.code(200).send({success: true});
    })

    done()
}

export default workingWeekendRoutes