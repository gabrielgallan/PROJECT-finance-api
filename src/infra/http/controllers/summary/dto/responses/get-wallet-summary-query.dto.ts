import { createZodDto } from 'nestjs-zod'
import z from 'zod'

export class GetWalletSummaryQueryDTO extends createZodDto(z.object({
    start: z.string(),
    end: z.string(),
})) { }
