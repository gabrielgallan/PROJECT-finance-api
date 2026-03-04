import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Encrypter } from '@/domain/identity/application/cryptography/encrypter'
import { Wallet } from '@prisma/client'

describe('Create transaction tests', () => {
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
                }
            }
        })

        token = await encrypter.encrypt({ sub: wallet.holderId })

        await app.init()
    })

    it('[POST] /api/wallet/transactions', async () => {
        return await request(app.getHttpServer())
            .post('/api/wallet/transactions')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Month Salary',
                amount: 1800,
                operation: 'income',
            })
            .expect(201)
    })

    afterAll(async () => {
        await app.close()
    })
})
