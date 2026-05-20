import { Public } from '@/infra/auth/public'
import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'
import z from 'zod'

class HealthResponseDTO extends createZodDto(z.object({
    ok: z.boolean(),
    timestamp: z.string()
})) { }

@Controller()
@Public()
@ApiTags('Server Actions')
export class ServerController {
    constructor() { }

    @Get('/health')
    @ApiOperation({ summary: 'get health status' })
    @ApiOkResponse({ description: 'Health status retrieved successfully', type: HealthResponseDTO })
    async health() {
        return {
            ok: true,
            timestamp: new Date().toISOString()
        }
    }
}
