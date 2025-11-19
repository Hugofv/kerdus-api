/**
 * Clients Service
 */

import { PrismaClient } from '@prisma/client';
import { CreateClientDto, UpdateClientDto } from '../dtos/clients.dto';

export class ClientsService {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters: { page?: number; limit?: number; accountId?: number; q?: string; includeDeleted?: boolean }) {
    const { page = 1, limit = 20, accountId, q, includeDeleted = false } = filters;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (!includeDeleted) {
      where.deletedAt = null;
    }
    if (accountId) {
      where.accountId = accountId;
    }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        include: {
          account: true,
          address: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.count({ where }),
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
    return this.prisma.client.findFirst({
      where,
      include: {
        account: true,
        address: true,
        operations: {
          include: {
            installmentsList: true,
          },
        },
      },
    });
  }

  async create(dto: CreateClientDto) {
    return this.prisma.client.create({
      data: {
        accountId: dto.accountId,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        meta: dto.meta,
      },
      include: {
        account: true,
        address: true,
      },
    });
  }

  async update(id: number, dto: UpdateClientDto) {
    return this.prisma.client.update({
      where: { id },
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        meta: dto.meta,
      },
      include: {
        account: true,
        address: true,
      },
    });
  }

  async delete(id: number) {
    // Soft delete: set deletedAt timestamp
    return this.prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

