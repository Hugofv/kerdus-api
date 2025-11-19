/**
 * Settings Service
 */

import { PrismaClient } from '@prisma/client';

export interface CreateSettingDto {
  accountId?: number;
  key: string;
  value?: unknown;
}

export interface UpdateSettingDto {
  value?: unknown;
}

export class SettingsService {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters: { page?: number; limit?: number; accountId?: number; includeDeleted?: boolean }) {
    const { page = 1, limit = 20, accountId, includeDeleted = false } = filters;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (!includeDeleted) {
      where.deletedAt = null;
    }
    if (accountId !== undefined) {
      where.accountId = accountId;
    }

    const [data, total] = await Promise.all([
      this.prisma.setting.findMany({
        where,
        skip,
        take: limit,
        include: {
          account: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.setting.count({ where }),
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

  async findByKey(accountId: number | null, key: string) {
    return this.prisma.setting.findUnique({
      where: {
        accountId_key: {
          accountId: accountId || null,
          key,
        },
      },
      include: {
        account: true,
      },
    });
  }

  async create(dto: CreateSettingDto) {
    return this.prisma.setting.create({
      data: {
        accountId: dto.accountId,
        key: dto.key,
        value: dto.value,
      },
      include: {
        account: true,
      },
    });
  }

  async update(accountId: number | null, key: string, dto: UpdateSettingDto) {
    return this.prisma.setting.update({
      where: {
        accountId_key: {
          accountId: accountId || null,
          key,
        },
      },
      data: {
        value: dto.value,
      },
      include: {
        account: true,
      },
    });
  }

  async upsert(accountId: number | null, key: string, value: unknown) {
    return this.prisma.setting.upsert({
      where: {
        accountId_key: {
          accountId: accountId || null,
          key,
        },
      },
      update: { value },
      create: {
        accountId: accountId || null,
        key,
        value,
      },
      include: {
        account: true,
      },
    });
  }

  async delete(accountId: number | null, key: string) {
    // Soft delete: set deletedAt timestamp
    return this.prisma.setting.update({
      where: {
        accountId_key: {
          accountId: accountId || null,
          key,
        },
      },
      data: { deletedAt: new Date() },
    });
  }
}

