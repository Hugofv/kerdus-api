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

export async function fetchEvents() {
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
      const scope = `event-${match.id}`;
      if (await wasSyncedToday('event', prisma, scope)) {
        continue;
      }

      const res = await api.get('/fixtures/events', {
        params: { fixture: match.externalId },
      });

      const events = res.data.response;
      if (!events?.length) {
        await markSync('event', prisma, scope); // marca mesmo se não tiver eventos
        continue;
      }

      for (const event of events) {
        const team = await prisma.team.findUnique({
          where: { externalId: event.team.id },
        });
        if (!team) continue;

        const existing = await prisma.matchEvent.findFirst({
          where: {
            matchId: match.id,
            teamId: team.id,
            player: event.player?.name || '',
            type: event.type,
            detail: event.detail,
            minute: event.time.elapsed,
          },
        });

        const data = {
          matchId: match.id,
          teamId: team.id,
          player: event.player?.name || '',
          assist: event.assist?.name || null,
          type: event.type,
          detail: event.detail,
          minute: event.time.elapsed,
          extraTime: event.time.extra ?? null,
          assistExternalId: event.assist?.id ?? null,
          playerExternalId: event.player?.id ?? null,
          comments: event.comments || null,
        };

        if (!existing) {
          await prisma.matchEvent.create({ data });
          totalNew++;
        } else {
          await prisma.matchEvent.update({
            where: { id: existing.id },
            data,
          });
          totalUpdated++;
        }
      }

      await markSync('event', prisma, scope);
      console.log(
        `✅ ${events.length} eventos processados para match ${match.id}`
      );
    }

    console.log(`🎯 Eventos: ${totalNew} novos, ${totalUpdated} atualizados`);
  } catch (error: any) {
    console.error(
      '❌ Erro ao importar eventos:',
      error.response?.data || error.message
    );
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) fetchEvents();
