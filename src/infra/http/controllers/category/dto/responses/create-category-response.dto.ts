import { createZodDto } from "nestjs-zod";
import z from "zod";

export class GetCategoriesResponseDTO extends createZodDto(z.array(
    z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        description: z.string().nullable()
    })
)) { }