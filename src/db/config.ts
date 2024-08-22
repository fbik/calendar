import {ClientConfig} from "pg";

export const dbConfig: ClientConfig = {
    host: 'localhost',
    port: 5432,
    database: 'calendar',
    user: 'calendar',
    password: 'test24password',
}