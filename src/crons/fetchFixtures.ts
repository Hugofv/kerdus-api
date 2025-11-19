// src/crons/fetchFixtures.ts
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { wasSyncedToday, markSync } from '../utils/syncLog';
import slugify from 'slugify';
import { format, parseISO, sub } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

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

export async function fetchFixtures() {
  try {
    const leagues = await prisma.league.findMany({
      where: { AND: [{ featuredRank: { gt: 0 } }, { isActive: true }] },
      orderBy: [{ featuredRank: 'asc' }, { country: 'asc' }],
    });

    const timeZone = 'America/Sao_Paulo';
    const zonedDate = sub(toZonedTime(new Date(), timeZone), {months: 5});

    const today = format(fromZonedTime(zonedDate, timeZone), 'yyyy-MM-dd');
    let totalNew = 0;
    let totalUpdated = 0;
    let totalUnchanged = 0;

    for (const league of leagues) {
      // const scope = `${league.id}-${league.season}-${today}`;

      // if (await wasSyncedToday('match', prisma, scope)) {
      //   console.log(`⏩ Liga ${league.name} já sincronizada hoje.`);
      //   continue;
      // }

      console.log(today)
      const res = await api.get('/fixtures', {
        params: {
          league: league.externalId,
          season: league.season,
          // date: today,
        },
      });

      const fixtures = res.data.response;

      for (const fixture of fixtures) {
        const { fixture: match, teams, goals, score } = fixture;
        const status = match.status;

        let venueId: number | null = null;
        const venueData = match.venue;

        if (venueData?.id && venueData.name) {
          const existingVenue = await prisma.venue.findUnique({
            where: { externalId: venueData.id },
          });

          venueId = existingVenue
            ? existingVenue.id
            : (
                await prisma.venue.create({
                  data: {
                    externalId: venueData.id,
                    name: venueData.name,
                    address: venueData.address,
                    city: venueData.city,
                    capacity: venueData.capacity,
                    surface: venueData.surface,
                    imageUrl: venueData.image || '',
                  },
                })
              ).id;
        }

        const homeTeam = await prisma.team.findUnique({
          where: { externalId: teams.home.id },
        });
        const awayTeam = await prisma.team.findUnique({
          where: { externalId: teams.away.id },
        });

        if (!homeTeam || !awayTeam) continue;

        const existingMatch = await prisma.match.findUnique({
          where: { externalId: match.id },
        });

        const slug = `${slugify(homeTeam.name)}-vs-${slugify(
          awayTeam.name
        )}-${format(parseISO(match.date), 'yyyy-MM-dd')}`.toLocaleLowerCase();

        const data = {
          externalId: match.id,
          leagueId: league.id,
          season: league.season,
          round: fixture.league.round,
          date: new Date(match.date),
          status: status?.long || null,
          stage: fixture.league.stage,
          referee: match.referee,
          updatedAt: new Date(),
          venueId,
          slug,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          homeScore: goals.home,
          awayScore: goals.away,
          homeHalfTimeScore: score.halftime?.home,
          awayHalfTimeScore: score.halftime?.away,
          homeFullTimeScore: score.fulltime?.home,
          awayFullTimeScore: score.fulltime?.away,
          homeExtraTimeScore: score.extratime?.home,
          awayExtraTimeScore: score.extratime?.away,
          homePenaltyScore: score.penalty?.home,
          awayPenaltyScore: score.penalty?.away,
          statusShort: status?.short || null,
          statusElapsed: status?.elapsed ?? null,
          statusExtra: String(status?.extra ?? '') || null,
        };

        if (!existingMatch) {
          await prisma.match.create({ data });
          totalNew++;
        } else {
          const updated = await prisma.match.update({
            where: { externalId: match.id },
            data,
          });
          if (updated) totalUpdated++;
          else totalUnchanged++;
        }
      }

      // await markSync('match', prisma, scope);
      console.log(
        `✅ ${fixtures.length} partidas processadas para ${league.name}`
      );
    }

    console.log(
      `🎯 Total de partidas: ${totalNew} novas, ${totalUpdated} atualizadas, ${totalUnchanged} inalteradas.`
    );
  } catch (error: any) {
    console.error(
      '❌ Erro ao importar partidas:',
      error.response?.data || error.message
    );
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) fetchFixtures();
