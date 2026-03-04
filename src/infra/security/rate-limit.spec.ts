import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'

describe('Rate limit tests', () => {
    let app: INestApplication

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = moduleRef.createNestApplication()

        await app.init()
    })

    it('Rate limit test', async () => {
        for (let i = 1; i <= 5; i++) {
            await request(app.getHttpServer())
                .post('/api/sessions')
                .send({
                    email: 'johndoe@email.com',
                    password: 'johnDoe123'
                })
        }

        await request(app.getHttpServer())
            .post('/api/sessions')
            .send({
                email: 'johndoe@email.com',
                password: 'johnDoe123'
            })
            .expect(429)
    })

    afterAll(async () => {
        await app.close()
    })
})
