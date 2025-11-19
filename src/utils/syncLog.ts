import { PrismaClient } from '@prisma/client';

export async function wasSyncedToday(
  type: string,
  prismaClient: PrismaClient,
  scope?: string
): Promise<boolean> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const exists = await prismaClient.syncLog.findFirst({
    where: {
      type,
      scope,
      syncedAt: { gte: startOfDay },
    },
  });

  return !!exists;
}

export async function markSync(
  type: string,
  prismaClient: PrismaClient,
  scope?: string,
): Promise<void> {
  await prismaClient.syncLog.create({
    data: {
      type,
      scope,
    },
  });
}
