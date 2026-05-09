export interface AppConfig {
  port: number
  databaseUrl: string
}

export function loadConfig(): AppConfig {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured')
  }

  return {
    port: Number(process.env.PORT ?? 3000),
    databaseUrl
  }
}
