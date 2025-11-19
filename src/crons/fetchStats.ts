import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { wasSyncedToday, markSync } from '../utils/syncLog';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const prisma = new PrismaClient();

const api = axios.create({
  baseURL: 'https://v3.football.api-sports.io',
  headers: {
    'x-apisports-key': process.env.API_KEY ?? '',
  },
});

export async function fetchStats() {
  try {
    const matches = await prisma.match.findMany({
      where: {
        date: {
          gte: new Date(Date.now() - 36 * 60 * 60 * 1000), // últimas 36h
        },
        statusShort: {
          in: ['1H', '2H', 'HT', 'ET', 'P', 'FT'],
        },
        league: {
          AND: [{ featuredRank: { gt: 0 } }, { isActive: true }],
        },
      },
      select: { id: true, externalId: true },
    });

    let totalNew = 0;
    let totalUpdated = 0;

    for (const match of matches) {
      const scope = `stats-${match.id}`;
      if (await wasSyncedToday('stats', prisma, scope)) {
        continue;
      }

      const res = await api.get('/fixtures/statistics', {
        params: { fixture: match.externalId },
      });

      const stats = res.data.response;
      if (!stats?.length) {
        await markSync('stats', prisma, scope);
        continue;
      }

      for (const entry of stats) {
        const team = await prisma.team.findUnique({
          where: { externalId: entry.team.id },
        });
        if (!team) continue;

        const existing = await prisma.matchStat.findFirst({
          where: {
            matchId: match.id,
            teamId: team.id,
          },
        });

        if (!existing) {
          await prisma.matchStat.create({
            data: {
              matchId: match.id,
              teamId: team.id,
              stats: entry.statistics,
            },
          });
          totalNew++;
        } else {
          await prisma.matchStat.update({
            where: { id: existing.id },
            data: { stats: entry.statistics },
          });
          totalUpdated++;
        }
      }

      await markSync('stats', prisma, scope);
      console.log(`✅ Estatísticas salvas para partida ${match.id}`);
    }

    console.log(
      `🎯 Estatísticas: ${totalNew} novas, ${totalUpdated} atualizadas`
    );
  } catch (error: any) {
    console.error(
      '❌ Erro ao importar estatísticas:',
      error.response?.data || error.message
    );
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) fetchStats();
