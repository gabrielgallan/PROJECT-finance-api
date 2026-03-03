
import { PipeTransform, BadRequestException } from '@nestjs/common'
import { ZodSchema } from 'zod'
import { fromZodError } from 'zod-validation-error'

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) { }

  transform(value: unknown) {
    const parsedValue = this.schema.safeParse(value)

    if (!parsedValue.success) {
      throw new BadRequestException({
        errors: fromZodError(parsedValue.error).details,
        message: 'Data validation failed'
      })
    }

    return parsedValue.data
  }
}
