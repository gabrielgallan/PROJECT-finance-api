import 'dotenv/config'

import { Operation, Prisma, PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const DEMO_USER = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Alex Morgan',
  email: 'demo@valora.app',
  password: 'demo123',
}

const DEMO_WALLET_ID = '22222222-2222-4222-8222-222222222222'
const INITIAL_BALANCE_IN_CENTS = 250_000

const categories = [
  {
    id: '33333333-3333-4333-8333-333333333331',
    name: 'Salary',
    slug: 'salary',
    description: 'Monthly salary and other work income',
  },
  {
    id: '33333333-3333-4333-8333-333333333332',
    name: 'Housing',
    slug: 'housing',
    description: 'Rent, maintenance and household expenses',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Food',
    slug: 'food',
    description: 'Groceries, restaurants and food delivery',
  },
  {
    id: '33333333-3333-4333-8333-333333333334',
    name: 'Transport',
    slug: 'transport',
    description: 'Public transit, fuel and vehicle expenses',
  },
  {
    id: '33333333-3333-4333-8333-333333333335',
    name: 'Leisure',
    slug: 'leisure',
    description: 'Entertainment, trips and social activities',
  },
] as const

type CategorySlug = (typeof categories)[number]['slug']

interface SeedTransaction {
  id: string
  title: string
  description: string
  amountInCents: number
  operation: Operation
  method: string
  categorySlug: CategorySlug
  daysAgo: number
}

const transactions: SeedTransaction[] = [
  {
    id: '44444444-4444-4444-8444-444444444401',
    title: 'Monthly salary',
    description: 'Current month salary payment',
    amountInCents: 520_000,
    operation: Operation.income,
    method: 'Bank transfer',
    categorySlug: 'salary',
    daysAgo: 1,
  },
  {
    id: '44444444-4444-4444-8444-444444444402',
    title: 'Apartment rent',
    description: 'Monthly apartment rent',
    amountInCents: 145_000,
    operation: Operation.expense,
    method: 'Bank transfer',
    categorySlug: 'housing',
    daysAgo: 4,
  },
  {
    id: '44444444-4444-4444-8444-444444444403',
    title: 'Weekly groceries',
    description: 'Groceries for the week',
    amountInCents: 18_675,
    operation: Operation.expense,
    method: 'Debit card',
    categorySlug: 'food',
    daysAgo: 8,
  },
  {
    id: '44444444-4444-4444-8444-444444444404',
    title: 'Subway pass',
    description: 'Monthly public transport pass',
    amountInCents: 7_250,
    operation: Operation.expense,
    method: 'Debit card',
    categorySlug: 'transport',
    daysAgo: 13,
  },
  {
    id: '44444444-4444-4444-8444-444444444405',
    title: 'Dinner with friends',
    description: 'Friday night dinner downtown',
    amountInCents: 9_430,
    operation: Operation.expense,
    method: 'Credit card',
    categorySlug: 'leisure',
    daysAgo: 20,
  },
  {
    id: '44444444-4444-4444-8444-444444444406',
    title: 'Monthly salary',
    description: 'Previous month salary payment',
    amountInCents: 520_000,
    operation: Operation.income,
    method: 'Bank transfer',
    categorySlug: 'salary',
    daysAgo: 35,
  },
  {
    id: '44444444-4444-4444-8444-444444444407',
    title: 'Apartment rent',
    description: 'Previous month apartment rent',
    amountInCents: 145_000,
    operation: Operation.expense,
    method: 'Bank transfer',
    categorySlug: 'housing',
    daysAgo: 42,
  },
  {
    id: '44444444-4444-4444-8444-444444444408',
    title: 'Supermarket',
    description: 'Monthly supermarket shopping',
    amountInCents: 21_245,
    operation: Operation.expense,
    method: 'Debit card',
    categorySlug: 'food',
    daysAgo: 50,
  },
  {
    id: '44444444-4444-4444-8444-444444444409',
    title: 'Monthly salary',
    description: 'Salary payment from two months ago',
    amountInCents: 520_000,
    operation: Operation.income,
    method: 'Bank transfer',
    categorySlug: 'salary',
    daysAgo: 65,
  },
  {
    id: '44444444-4444-4444-8444-444444444410',
    title: 'Weekend trip',
    description: 'Hotel and activities for a weekend trip',
    amountInCents: 48_000,
    operation: Operation.expense,
    method: 'Credit card',
    categorySlug: 'leisure',
    daysAgo: 75,
  },
  {
    id: '44444444-4444-4444-8444-444444444411',
    title: 'Monthly salary',
    description: 'Salary payment from three months ago',
    amountInCents: 520_000,
    operation: Operation.income,
    method: 'Bank transfer',
    categorySlug: 'salary',
    daysAgo: 95,
  },
  {
    id: '44444444-4444-4444-8444-444444444412',
    title: 'Car repair',
    description: 'Scheduled maintenance and replacement parts',
    amountInCents: 62_000,
    operation: Operation.expense,
    method: 'Credit card',
    categorySlug: 'transport',
    daysAgo: 125,
  },
]

function getDateFromDaysAgo(daysAgo: number) {
  const date = new Date()

  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() - daysAgo)

  return date
}

function centsToDecimal(valueInCents: number) {
  return new Prisma.Decimal((valueInCents / 100).toFixed(2))
}

function calculateCurrentBalanceInCents() {
  return transactions.reduce((balance, transaction) => {
    if (transaction.operation === Operation.income) {
      return balance + transaction.amountInCents
    }

    return balance - transaction.amountInCents
  }, INITIAL_BALANCE_IN_CENTS)
}

async function main() {
  const passwordHash = await hash(DEMO_USER.password, 8)
  const currentBalanceInCents = calculateCurrentBalanceInCents()

  await prisma.$transaction(
    async (database) => {
      const user = await database.user.upsert({
        where: { email: DEMO_USER.email },
        update: {
          name: DEMO_USER.name,
          passwordHash,
        },
        create: {
          id: DEMO_USER.id,
          name: DEMO_USER.name,
          email: DEMO_USER.email,
          passwordHash,
        },
      })

      const wallet = await database.wallet.upsert({
        where: { holderId: user.id },
        update: {
          balance: centsToDecimal(currentBalanceInCents),
        },
        create: {
          id: DEMO_WALLET_ID,
          holderId: user.id,
          balance: centsToDecimal(currentBalanceInCents),
        },
      })

      const categoryIds = new Map<CategorySlug, string>()

      for (const category of categories) {
        const savedCategory = await database.category.upsert({
          where: {
            walletId_slug: {
              walletId: wallet.id,
              slug: category.slug,
            },
          },
          update: {
            name: category.name,
            description: category.description,
          },
          create: {
            id: category.id,
            walletId: wallet.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
          },
        })

        categoryIds.set(category.slug, savedCategory.id)
      }

      for (const transaction of transactions) {
        const categoryId = categoryIds.get(transaction.categorySlug)

        if (!categoryId) {
          throw new Error(`Category not found: ${transaction.categorySlug}`)
        }

        const transactionData = {
          walletId: wallet.id,
          categoryId,
          title: transaction.title,
          description: transaction.description,
          amount: centsToDecimal(transaction.amountInCents),
          operation: transaction.operation,
          method: transaction.method,
          createdAt: getDateFromDaysAgo(transaction.daysAgo),
        }

        await database.transaction.upsert({
          where: { id: transaction.id },
          update: transactionData,
          create: {
            id: transaction.id,
            ...transactionData,
          },
        })
      }
    },
    {
      maxWait: 5_000,
      timeout: 20_000,
    },
  )

  console.log('Demo data seeded successfully.')
  console.log(`Email: ${DEMO_USER.email}`)
  console.log(`Password: ${DEMO_USER.password}`)
  console.log(`Balance: $${(calculateCurrentBalanceInCents() / 100).toFixed(2)}`)
  console.log(`Categories processed: ${categories.length}`)
  console.log(`Transactions processed: ${transactions.length}`)
}

main()
  .catch((error: unknown) => {
    console.error('Failed to seed the database:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
