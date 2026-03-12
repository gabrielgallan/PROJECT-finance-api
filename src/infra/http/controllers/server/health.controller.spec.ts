import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'

describe('Get server health tests', () => {
    let app: INestApplication

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = moduleRef.createNestApplication()
        await app.init()
    })

    it('[GET] /api/health', async () => {
        await request(app.getHttpServer())
            .get('/api/health')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty('ok', true)
                expect(res.body).toHaveProperty('timestamp')
            })
    })

    afterAll(async () => {
        await app.close()
    })
})