import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Encrypter } from '@/domain/identity/application/cryptography/encrypter'
import { Wallet } from '@prisma/client'
import { RedisCacheRepositoryMock } from 'test/e2e/mocks/redis-cache-repository-mock'
import { CacheRepository } from '@/infra/cache/cache-repository'

describe('Get current month wallet progress tests', () => {
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
                            createdAt: new Date(2025, 3, 12)
                        },
                        {
                            title: 'Transaction 3',
                            amount: 2300,
                            operation: 'income',
                            createdAt: new Date(2025, 3, 19)
                        },
                        {
                            title: 'Transaction 4',
                            amount: 280.80,
                            operation: 'expense',
                            createdAt: new Date(2025, 3, 26)
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

    it('[GET] /api/wallet/summary/month', async () => {
        vi.setSystemTime(new Date(2025, 3, 30))

        const response = await request(app.getHttpServer())
            .get('/api/wallet/summary/month')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)

        expect(response.body.progress).toEqual(
            expect.objectContaining({
                month: expect.any(Object),
                weeks: expect.any(Array),
            }),
        )

        expect(response.body.progress.month).toEqual(
            expect.objectContaining({
                totals: {
                    income: 3800,
                    expense: expect.any(Number),
                },
                counts: 4,
                netBalance: expect.any(Number),
            }),
        )

        expect(response.body.progress.month.totals.expense).toBeCloseTo(480.8, 2)
        expect(response.body.progress.month.netBalance).toBeCloseTo(3319.2, 2)

        const transactionsByWeeks = response.body.progress.weeks.reduce(
            (total: number, week: { summary: { counts: { transactions: number } } }) => {
                return total + week.summary.counts.transactions
            },
            0,
        )

        expect(transactionsByWeeks).toBe(4)
        expect(response.body.progress.weeks).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    week: expect.any(Number),
                    summary: expect.objectContaining({
                        totals: expect.objectContaining({
                            income: expect.any(Number),
                            expense: expect.any(Number),
                        }),
                        counts: expect.objectContaining({
                            transactions: expect.any(Number),
                        }),
                    }),
                }),
            ]),
        )
    })

    afterAll(async () => {
        await app.close()
    })
})
