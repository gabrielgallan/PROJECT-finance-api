import { createZodDto } from "nestjs-zod";
import z from "zod";

export class ListTransactionsResponseDTO extends createZodDto(z.object({
    interval: z.object({
        startDate: z.string(),
        endDate: z.string()
    }),
    transactions: z.array(
        z.object({
            id: z.string(),
            title: z.string(),
            amount: z.number(),
            operation: z.union([z.literal('income'), z.literal('expense')]),
            description: z.string().nullable(),
            method: z.string().nullable(),
            category: z.object({
                name: z.string(),
                slug: z.string()
            }).nullable(),
            createdAt: z.string()
        })
    ),
    pagination: z.object({
        page: z.number(),
        limit: z.number()
    })
})) { }