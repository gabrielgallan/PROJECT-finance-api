import { EnvService } from "@/infra/env/env.service";
import { Injectable, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
    constructor(env: EnvService) {
        super(env.get('REDIS_URL'))
    }

    onModuleDestroy() {
        return this.disconnect()
    }
}