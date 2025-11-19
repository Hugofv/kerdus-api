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

export async function fetchStandings() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayStart = new Date(`${today}T00:00:00Z`);
    const todayEnd = new Date(`${today}T23:59:59Z`);

    const matchesToday = await prisma.match.findMany({
      where: {
        date: { gte: todayStart, lte: todayEnd },
        leagueId: { not: null },
        league: {
          AND: [{ featuredRank: { gt: 0 } }, { isActive: true }],
        },
      },
      select: { leagueId: true, season: true },
      distinct: ['leagueId', 'season'],
    });

    const leagues = await prisma.league.findMany({
      where: {
        id: {
          in: matchesToday
            .map((m) => m.leagueId)
            .filter((id): id is number => id !== null),
        },
      },
      orderBy: { featuredRank: 'asc' },
    });

    let totalUpdated = 0;

    for (const league of leagues) {
      const season = matchesToday.find((m) => m.leagueId === league.id)?.season;
      if (!season) continue;

      // const scope = `standing-${league.id}-${season}`;
      // if (await wasSyncedToday('standing', prisma, scope)) {
      //   console.log(`⏭️ Standings já sincronizado para ${league.name}`);
      //   continue;
      // }

      const res = await api.get('/standings', {
        params: {
          league: league.externalId,
          season,
        },
      });

      const groups = res.data.response?.[0]?.league?.standings;
      if (!groups?.length) continue;

      for (const group of groups) {
        for (const row of group) {
          const team = await prisma.team.findUnique({
            where: { externalId: row.team.id },
          });

          if (!team) {
            console.log(`⚠️ Time não encontrado: ${row.team.name}`);
            continue;
          }

          await prisma.standing.upsert({
            where: {
              leagueId_season_teamId: {
                leagueId: league.id,
                season,
                teamId: team.id,
              },
            },
            update: {
              rank: row.rank,
              points: row.points,
              played: row.all.played,
              win: row.all.win,
              draw: row.all.draw,
              lose: row.all.lose,
              goalsFor: row.all.goals.for,
              goalsAgainst: row.all.goals.against,
              goalDiff: row.goalsDiff,
              form: row.form || null,
              group: row.group || null,
              processedAt: new Date(),
            },
            create: {
              leagueId: league.id,
              season,
              teamId: team.id,
              rank: row.rank,
              points: row.points,
              played: row.all.played,
              win: row.all.win,
              draw: row.all.draw,
              lose: row.all.lose,
              goalsFor: row.all.goals.for,
              goalsAgainst: row.all.goals.against,
              goalDiff: row.goalsDiff,
              form: row.form || null,
              group: row.group || null,
              processedAt: new Date(),
            },
          });

          totalUpdated++;
        }
      }

      // await markSync('standing', prisma, scope);
      console.log(`✅ Classificação atualizada para ${league.name}`);
    }

    console.log(`🎯 Standings processadas: ${totalUpdated}`);
  } catch (error: any) {
    console.error(
      '❌ Erro ao importar standings:',
      error.response?.data || error.message
    );
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) fetchStandings();
