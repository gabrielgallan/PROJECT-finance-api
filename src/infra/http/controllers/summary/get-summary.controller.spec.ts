import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Encrypter } from '@/domain/identity/application/cryptography/encrypter'
import { Wallet } from '@prisma/client'

describe('Get wallet summary tests', () => {
    let app: INestApplication
    let prisma: PrismaService
    let encrypter: Encrypter

    let wallet: Wallet
    let token: string

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

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
                            amount: 1800,
                            operation: 'income',
                            createdAt: new Date(2025, 0, 10)
                        },
                        {
                            title: 'Transaction 2',
                            amount: 450,
                            operation: 'expense',
                            createdAt: new Date(2025, 0, 15)
                        },
                        {
                            title: 'Transaction 3',
                            amount: 100,
                            operation: 'income',
                            createdAt: new Date(2025, 0, 25)
                        },
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

    it('[GET] /api/wallet/summary?start={date}&end={date}', async () => {
        vi.setSystemTime(new Date(2025, 0, 30))

        const response = await request(app.getHttpServer())
            .get('/api/wallet/summary')
            .set('Authorization', `Bearer ${token}`)
            .query({
                start: '2025-01-01',
                end: '2025-01-30',
            })
            .expect(200)

        expect(response.body.summary).toEqual(
            expect.objectContaining({
                totals: {
                    income: 1900,
                    expense: 450
                },
                netBalance: 1450,
                counts: {
                    transactions: 3
                }
            })
        )
    })

    afterAll(async () => {
        await app.close()
    })
})
