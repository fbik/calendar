import {FastifyInstance, FastifyPluginOptions} from 'fastify';
import {CustomDate} from "../types";


export interface ListResponse {
    200: { dates: CustomDate[] };
    '4xx': { error: string };
    '5xx': { error: string };
}

export type AddRequest = CustomDate;

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


const holidayRoutes = (instance: FastifyInstance, opts: FastifyPluginOptions, done: () => void) => {
    instance.get<{
        Reply: ListResponse
    }>('/list', (request, reply) => {
        instance.pg.query<CustomDate>(
            'SELECT * FROM holiday', [],
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
            'INSERT INTO holiday values ($1, $2, $3)', [date.day, date.month, date.year],
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
            'DELETE FROM holiday WHERE day = $1 AND month = $2 AND year = $3', [date.day, date.month, date.year],
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

export default holidayRoutes