import pg, {ClientConfig} from 'pg'
import path from 'node:path'
import {migrate} from "postgres-migrations"

export default async function migrateDb(config: ClientConfig): Promise<void> {
    const client = new pg.Client(config);

    try {
        await client.connect();
        await migrate({client}, path.join(__dirname, '/migrations/'), {logger: console.warn})

        process.exitCode = 0
    } catch (err) {
        console.error(err)
        process.exitCode = 1
    } finally {
        await client.end()
    }
}
