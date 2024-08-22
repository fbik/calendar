import fastify from 'fastify';
import holidayRoutes from "./routes/holiday";
import workingWeekendRoutes from "./routes/working-weekend";
import workingHourRoutes from "./routes/working-hour";
import dayRoutes from "./routes/day";
import migrate from "./db/migrate";
import fastifyPostgres from "@fastify/postgres"
import {dbConfig} from "./db/config";

const server = fastify()

server.addHook('onReady', () => migrate(dbConfig))

server.register(fastifyPostgres, dbConfig);

server.register(holidayRoutes, {prefix: '/holiday'});
server.register(workingWeekendRoutes, {prefix: '/working-weekend'});
server.register(workingHourRoutes, {prefix: '/working-hour'});
server.register(dayRoutes, {prefix: '/day'});


server.addContentTypeParser('text/plain', (req, body, done) => {
    // Reject text/plain so that only application/json is supported
    done(new Error('Unsupported Media Type'), undefined);
});

server.listen({port: 8080}, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
