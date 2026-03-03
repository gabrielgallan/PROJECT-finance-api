import { CategoriesRepository } from "@/domain/finances/application/repositories/categories-repository";
import { Category } from "@/domain/finances/enterprise/entities/category";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { PrismaCategoryMapper } from "../mappers/prisma-category-mapper";

/* eslint-disable */
@Injectable()
export class PrismaCategoriesRepository implements CategoriesRepository {
    constructor(private prisma: PrismaService) { }


    async create(category: Category) {
        const data = PrismaCategoryMapper.toPrisma(category)

        const prismaCategory = await this.prisma.category.create({
            data
        })

        return
    }

    async findById(id: string) {
        const prismaCategory = await this.prisma.category.findUnique({
            where: { id }
        })

        if (!prismaCategory) {
            return null
        }

        return PrismaCategoryMapper.toDomain(prismaCategory)
    }

    async findByIdAndWalletId(id: string, walletId: string): Promise<Category | null> {
        const prismaCategory = await this.prisma.category.findUnique({
            where: {
                id,
                walletId
            }
        })

        if (!prismaCategory) {
            return null
        }

        return PrismaCategoryMapper.toDomain(prismaCategory)
    }

    async findByWalletIdAndSlug(walletId: string, slug: string) {
        const prismaCategory = await this.prisma.category.findUnique({
            where: {
                walletId_slug: {
                    walletId,
                    slug
                }
            }
        })

        if (!prismaCategory) {
            return null
        }

        return PrismaCategoryMapper.toDomain(prismaCategory)
    }

    async findManyByWalletId(walletId: string) {
        const prismaCategories = await this.prisma.category.findMany({
            where: {
                walletId
            }
        })

        return prismaCategories.map(PrismaCategoryMapper.toDomain)
    }

    async save(category: Category) {
        const data = PrismaCategoryMapper.toPrisma(category)

        const updated = await this.prisma.category.update({
            where: { id: category.id.toString() },
            data
        })

        return PrismaCategoryMapper.toDomain(updated)
    }

    async deleteAllByWalletId(walletId: string) {
        const result = await this.prisma.category.deleteMany({
            where: {
                walletId
            }
        })

        return result.count
    }
}