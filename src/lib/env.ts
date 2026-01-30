import { cleanEnv, str, port } from 'envalid'

export const env = cleanEnv(process.env, {
  COOKIE_SECRET: str({ default: 'development-secret-at-least-32-chars!!' }),
  PUBLIC_URL: str({ default: '' }),
  PORT: port({ default: 3333 }),
  ATPROTO_JWK_PRIVATE: str({ default: '' }),
})
