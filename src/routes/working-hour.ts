import {FastifyInstance, FastifyPluginOptions} from 'fastify';
import {calculateWorkingHours, nextMonth} from "../service/calculator";
import {CheckRequest} from "./day";

export interface WorkingHoursGetRequest {
    year: number;
    months: number | [number, number]
}

function toNumberArray(value: number | [number, number]): number[] {
    if (typeof value === 'number') {
        return [value];
    } else {
        const [from, to] = value
        return Array.from({length: (to + 1) - from}, (_, i) => from + i)
    }
}


export interface GetResponse {
    200: { workHoursCount: number };
    '4xx': { error: string };
    '5xx': { error: unknown };
}


const workingHourRoutes = (instance: FastifyInstance, opts: FastifyPluginOptions, done: () => void) => {
    // fetch don't support body in GET
    instance.post<{
        Body: WorkingHoursGetRequest,
        Reply: GetResponse
    }>('/get', (request, reply) => {
        instance.pg.connect(async (err, client, release) => {
            if (err) return reply.code(500).send({error: err.message})
            if (client === undefined) return reply.code(500).send({error: "No client"})

            const year = request.body.year;
            const months = toNumberArray(request.body.months);


            try {
                const allWorkingHoursPromise = months.map(async month => {
                    const nextMonthh = nextMonth({year, month, day: 1}).month;
                    const nextYear = nextMonth({year, month, day: 1}).year;

                    const holidaysResult = await client.query<CheckRequest>(
                        'SELECT * FROM holiday WHERE month IN ($1, $2) AND year IN ($3, $4)',
                        [month, nextMonthh, year, nextYear],
                    )
                    const holidays = holidaysResult.rows;

                    const workingWeekendsResult = await client.query<CheckRequest>(
                        'SELECT * FROM working_weekend WHERE month IN ($1, $2) AND year IN ($3, $4)',
                        [month, nextMonthh, year, nextYear],
                    )
                    const workingWeekends = workingWeekendsResult.rows;

                    const workingHours = calculateWorkingHours(year, month, {holidays, workingWeekends});

                    instance.pg.query(
                        'INSERT INTO working_hours values ($1, $2, $3) ON CONFLICT (month, year) DO UPDATE SET hours = $3',
                        [month, year, workingHours],
                        err => {
                            if (err) {
                                reply.code(500).send({error: err.message})
                            }
                        })

                    return workingHours
                })

                const allWorkingHours = await Promise.all(allWorkingHoursPromise)
                console.error("sdfgh", allWorkingHours)
                const workingHoursSum = allWorkingHours.reduce((acc, c) => acc + c, 0)
                console.error("uuuuuuu", allWorkingHours)
                reply.code(200).send({workHoursCount: workingHoursSum});
                console.error("sent", allWorkingHours)
            } catch (err) {
                reply.code(500).send({error: err})
            } finally {
                release()
            }
        })
    })

    done()
}

export default workingHourRoutes