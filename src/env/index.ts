import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3000),
})

const _env = envSchema.safeParse(process.env) // safeParse is a method from zod que retorna um objeto com as propriedades data, error e success.

if (!_env.success) {
  console.error('🔥 Deu ruim no env')
  throw new Error(_env.error.message)
}

export const env = _env.data // data é a propriedade que contém o .env com as propriedades que definimos no envSchema.

// Agora usaremos o env no lugar do .env nos arquivos que precisam de acesso às variáveis de ambiente.
