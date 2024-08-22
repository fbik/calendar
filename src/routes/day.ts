import {FastifyInstance, FastifyPluginOptions} from 'fastify';
import {CustomDate, DayType} from "../types";
import {checkDayType, nextMonth} from "../service/calculator";

export type CheckRequest = CustomDate


export interface CheckResponse {
    200: { dayType: DayType };
    '4xx': { error: string };
    '5xx': { error: unknown };
}


const dayRoutes = (instance: FastifyInstance, opts: FastifyPluginOptions, done: () => void) => {
    // fetch don't support body in GET
    instance.post<{
        Body: CheckRequest,
        Reply: CheckResponse
    }>('/check', (request, reply) => {
        instance.pg.connect(async (err, client, release) => {
            if (err) return reply.code(500).send({error: err.message})
            if (client === undefined) return reply.code(500).send({error: "No client"})

            const date = request.body;
            const nextMonthDate = nextMonth(date)

            try {
                const holidaysResult = await client.query<CheckRequest>(
                    'SELECT * FROM holiday WHERE month IN ($1, $2) AND year IN ($3, $4)',
                    [date.month, nextMonthDate.month, date.year, nextMonthDate.year],
                )
                const holidays = holidaysResult.rows;

                const workingWeekendsResult = await client.query<CheckRequest>(
                    'SELECT * FROM working_weekend WHERE month IN ($1, $2) AND year IN ($3, $4)',
                    [date.month, nextMonthDate.month, date.year, nextMonthDate.year],
                )
                const workingWeekends = workingWeekendsResult.rows;

                const dayType = checkDayType(date, {holidays, workingWeekends});
                reply.code(200).send({dayType});
            } catch (err) {
                reply.code(500).send({error: err})
            }
        })
    })

    done()
}

export default dayRoutes