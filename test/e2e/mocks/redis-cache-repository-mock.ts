import { CacheRepository } from "@/infra/cache/cache-repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RedisCacheRepositoryMock implements CacheRepository {
    private cache: Map<string, string> = new Map()

    set(key: string, value: string): Promise<void> {
        this.cache.set(key, value)
        return Promise.resolve()
    }

    get(key: string): Promise<string | null> {
        const value = this.cache.get(key) || null
        return Promise.resolve(value)
    }

    delete(key: string): Promise<void> {
        this.cache.delete(key)
        return Promise.resolve()
    }

}