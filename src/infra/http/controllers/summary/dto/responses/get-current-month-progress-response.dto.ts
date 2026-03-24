import { createZodDto } from 'nestjs-zod'
import z from 'zod'

export class GetCurrentMonthProgressResponseDTO extends createZodDto(z.object({
    progress: z.object({
        month: z.object({
            interval: z.object({
                startDate: z.string(),
                endDate: z.string(),
            }),
            totals: z.object({
                income: z.number(),
                expense: z.number(),
            }),
            netBalance: z.number(),
            counts: z.number(),
        }),
        weeks: z.array(
            z.object({
                week: z.number(),
                summary: z.object({
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
                }),
            }),
        ),
    }),
})) { }
