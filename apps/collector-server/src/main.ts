import 'dotenv/config'
import { createApp } from './app'
import { loadConfig } from './config'
import { createPool } from './db/client'
import { migrateDatabase } from './db/migrate'
import { EventRepository } from './db/event-repository'
import { ReportRepository } from './db/report-repository'

const start = async () => {
  const config = loadConfig()
  const pool = createPool(config.databaseUrl)

  try {
    await migrateDatabase(pool)

    const app = createApp({
      eventRepository: new EventRepository(pool),
      reportRepository: new ReportRepository(pool)
    })

    await app.listen({
      port: config.port,
      host: '0.0.0.0'
    })

    app.log.info(`collector server started at http://localhost:${config.port}`)
  } catch (error) {
    await pool.end()
    throw error
  }
}

void start().catch((error) => {
  console.error(error)
  process.exit(1)
})
