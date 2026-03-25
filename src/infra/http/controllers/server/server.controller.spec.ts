import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'

describe('Server actions tests', () => {
    let app: INestApplication

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = moduleRef.createNestApplication()
        await app.init()
    })

    it('[GET] /health', async () => {
        await request(app.getHttpServer())
            .get('/health')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty('ok', true)
                expect(res.body).toHaveProperty('timestamp')
            })
    })

    it('[GET] /debug should return 500 for unhandled errors', async () => {
        await request(app.getHttpServer())
            .get('/debug')
            .expect(500)
            .expect((res) => {
                expect(res.body).toEqual({
                    statusCode: 500,
                    message: 'Internal server error',
                    error: 'InternalServerError',
                })
            })
    })

    afterAll(async () => {
        await app.close()
    })
})
