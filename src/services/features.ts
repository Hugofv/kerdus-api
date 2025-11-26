/**
 * Features Service
 */

import { PrismaClient } from '@prisma/client';
import { CreateFeatureDto, UpdateFeatureDto } from '../dtos/features.dto';
import { InputJsonValue } from '@prisma/client/runtime/library';

export class FeaturesService {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters: { 
    page?: number; 
    limit?: number; 
    category?: string;
    isActive?: boolean;
    includeDeleted?: boolean;
  }) {
    const { page = 1, limit = 20, category, isActive, includeDeleted = false } = filters;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (!includeDeleted) {
      where.deletedAt = null;
    }
    if (category) {
      where.category = category;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.feature.findMany({
        where,
        skip,
        take: limit,
        include: {
          plans: {
            include: {
              plan: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          creator: true,
          updater: true,
        },
        orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.feature.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number, includeDeleted = false) {
    const where: Record<string, unknown> = { id };
    if (!includeDeleted) {
      where.deletedAt = null;
    }
    return this.prisma.feature.findFirst({
      where,
      include: {
        plans: {
          include: {
            plan: true,
          },
        },
        creator: true,
        updater: true,
      },
    });
  }

  async findByKey(key: string) {
    return this.prisma.feature.findUnique({
      where: { key },
      include: {
        plans: {
          include: {
            plan: true,
          },
        },
      },
    });
  }

  async create(dto: CreateFeatureDto, createdBy?: number) {
    return this.prisma.feature.create({
      data: {
        ...dto,
        meta: dto.meta as unknown as InputJsonValue,
        createdBy,
      },
      include: {
        plans: {
          include: {
            plan: true,
          },
        },
      },
    });
  }

  async update(id: number, dto: UpdateFeatureDto, updatedBy?: number) {
    return this.prisma.feature.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.meta && { meta: dto.meta as unknown as InputJsonValue }),
        ...(updatedBy !== undefined && { updatedBy }),
      },
      include: {
        plans: {
          include: {
            plan: true,
          },
        },
      },
    });
  }

  async delete(id: number) {
    // Soft delete
    return this.prisma.feature.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

