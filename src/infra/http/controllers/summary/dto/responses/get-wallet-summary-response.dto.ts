import { createZodDto } from 'nestjs-zod'
import z from 'zod'

const walletSummarySchema = z.object({
    categoryId: z.string().nullable(),
    interval: z.object({
        startDate: z.string(),
        endDate: z.string(),
    }),
    totals: z.object({
        income: z.number(),
        expense: z.number(),
    }),
    netBalance: z.number(),
    counts: z.object({
        transactions: z.number(),
    }),
    percentages: z.object({
        income: z.number(),
        expense: z.number(),
    }).nullable(),
})

export class GetWalletSummaryResponseDTO extends createZodDto(z.object({
    summary: walletSummarySchema,
})) { }
