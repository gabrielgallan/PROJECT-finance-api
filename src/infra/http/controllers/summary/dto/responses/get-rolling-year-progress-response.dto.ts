import { createZodDto } from 'nestjs-zod'
import z from 'zod'

export class GetRollingYearProgressResponseDTO extends createZodDto(z.object({
    progress: z.object({
        year: z.object({
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
        }),
        months: z.array(
            z.object({
                year: z.number(),
                monthIndex: z.number(),
                summary: z.object({
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
