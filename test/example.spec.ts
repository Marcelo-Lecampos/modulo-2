import { test } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

test('o usuário consegue criar uma nova transação', async () => {
  await request(app.server)
    .post('/transactions')
    .send({
      title: 'New Transaction',
      amount: 5000,
      type: 'credit',
    })
    .expect(201)

  // expect(response.statusCode).toEqual(201)
})
