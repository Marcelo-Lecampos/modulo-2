import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import z from 'zod'
import { randomUUID } from 'crypto'
import { checkSessionIdExist } from '../middlewares/check-session-id-exists'

export async function transactionsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request, response) => {
    console.log(`${request.method} ${request.url}`)
  })

  app.get('/:id', async (request) => {
    const getTransactionSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getTransactionSchema.parse(request.params)

    const transaction = await knex('transactions').where('id', id).first() // first() retorna apenas o primeiro resultado

    return { transaction }
  })

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExist], // é um array de funções que serão executadas antes de chegar na rota
    },
    async (request, response) => {
      const sessionId = request.cookies.sessionId

      // if (!sessionId) {
      //   return response.status(401).send({
      //     message: 'Você precisa estar logado para acessar essa rota',
      //   })
      // }

      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select()

      return { transactions } // sempre colocar dentro de um objeto, pois assim podemos adicionar mais coisas sem quebrar a API para quem já está usando
    },
  )

  app.get('/summary', async () => {
    const summary = await knex('transactions').sum('amount', { as: 'amount' }) // segundo parâmetro permite renomear o campo

    return { summary }
  })

  app.post('/', async (request, response) => {
    const createTransactionSchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { amount, title, type } = createTransactionSchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      response.cookie('sessionId', sessionId, {
        // primeiro argumento é o nome do cookie, segundo é o valor, terceiro é um objeto com as opções
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      })
    }

    await knex('transactions').insert({
      id: randomUUID(),
      amount: type === 'debit' ? -amount : amount,
      title,
      session_id: sessionId,
    })

    return response.status(201).send()
  })
} //
