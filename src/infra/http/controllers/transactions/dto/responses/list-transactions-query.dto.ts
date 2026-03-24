import { createZodDto } from "nestjs-zod";
import z from "zod";

export class ListTransactionsQueryDTO extends createZodDto(z.object({
    start: z.string().optional(),
    end: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional()
})) { }