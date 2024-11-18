import { test, describe } from 'node:test'
import supertest from 'supertest'
import { app } from '../index'

const appRequest = supertest(app)

describe('testing test', () => { 
    test('GET /', async () => {
        await appRequest
            .get('/')
            .expect(200)
    })
})