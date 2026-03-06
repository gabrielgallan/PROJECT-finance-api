import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Encrypter } from '@/domain/identity/application/cryptography/encrypter'
import { Wallet } from '@prisma/client'
import { RedisCacheRepositoryMock } from 'test/e2e/mocks/redis-cache-repository-mock'
import { CacheRepository } from '@/infra/cache/cache-repository'

describe('Get rolling year wallet summaries tests', () => {
    let app: INestApplication
    let prisma: PrismaService
    let encrypter: Encrypter

    let wallet: Wallet
    let token: string

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(CacheRepository)
            .useClass(RedisCacheRepositoryMock)
            .compile()

        app = moduleRef.createNestApplication()

        prisma = moduleRef.get(PrismaService)

        encrypter = moduleRef.get(Encrypter)

        wallet = await prisma.wallet.create({
            data: {
                holder: {
                    create: {
                        email: 'johndoe@email.com',
                    }
                },
                transactions: {
                    create: [
                        {
                            title: 'Transaction 1',
                            amount: 1500,
                            operation: 'income',
                            createdAt: new Date(2025, 3, 5)
                        },
                        {
                            title: 'Transaction 2',
                            amount: 200,
                            operation: 'expense',
                            createdAt: new Date(2025, 6, 9)
                        },
                        {
                            title: 'Transaction 3',
                            amount: 2300,
                            operation: 'income',
                            createdAt: new Date(2025, 9, 17)
                        },
                        {
                            title: 'Transaction 4',
                            amount: 280.80,
                            operation: 'expense',
                            createdAt: new Date(2025, 12, 20)
                        }
                    ]
                }
            }
        })

        token = await encrypter.encrypt({ sub: wallet.holderId })

        await app.init()
    })

    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('[GET] /api/wallet/summary/year', async () => {
        vi.setSystemTime(new Date(2025, 0, 30))

        const response = await request(app.getHttpServer())
            .get('/api/wallet/summary/year')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)

        expect(response.body.progress.months).toHaveLength(12)
    })

    afterAll(async () => {
        await app.close()
    })
})
