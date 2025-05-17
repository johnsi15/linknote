const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue

  if (!value) {
    throw new Error(`The env variable ${key} no is defined.`)
  }

  return value
}

export const dbConfig = {
  url: getEnvVariable('TURSO_DATABASE_URL'),
  authToken: getEnvVariable('TURSO_AUTH_TOKEN'),
}

export const authConfig = {
  clerkPublishableKey: getEnvVariable('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'),
  clerkSecretKey: getEnvVariable('CLERK_SECRET_KEY'),
}

export const apiConfig = {
  baseUrl: getEnvVariable(
    'NEXT_PUBLIC_API_URL',
    process.env.NODE_ENV === 'production' ? 'https://api.tudominio.com' : 'http://localhost:3000/api'
  ),
}

export const aiConfig = {
  openaiApiKey: getEnvVariable('OPENAI_API_KEY', ''),
  useAI: getEnvVariable('NEXT_PUBLIC_USE_AI', 'false') === 'true',
}

export const appConfig = {
  environment: getEnvVariable('NODE_ENV', 'development'),
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  appName: getEnvVariable('NEXT_PUBLIC_APP_NAME', 'LinkNote'),
  appUrl: getEnvVariable('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
}

const config = {
  db: dbConfig,
  auth: authConfig,
  api: apiConfig,
  ai: aiConfig,
  app: appConfig,
}

export default config
