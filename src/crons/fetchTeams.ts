import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { downloadAndUploadImage } from '../utils/imageUploader';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const prisma = new PrismaClient();

const api = axios.create({
  baseURL: 'https://v3.football.api-sports.io',
  headers: { 'x-apisports-key': process.env.API_KEY ?? '' },
});

export async function fetchTeams() {
  const LIMIT = 700;
  try {
    const allLeagues = await prisma.league.findMany();
    const alreadyImported = await prisma.leagueImportLog.findMany({
      select: { leagueId: true, season: true },
    });

    const alreadySet = new Set(
      alreadyImported.map((log) => `${log.leagueId}-${log.season}`)
    );

    const leagues = allLeagues.filter(
      (l) => !alreadySet.has(`${l.externalId}-${l.season}`)
    );

    const sorted = leagues.sort((a, b) => {
      const score = (l: typeof a) =>
        l.country?.toLowerCase().includes('brazil') ||
        l.country?.toLowerCase().includes('brasil') ||
        l.country?.toLowerCase().includes('argentina') ||
        l.country?.toLowerCase().includes('uruguay') ||
        l.country?.toLowerCase().includes('colombia')
          ? -1
          : 1;
      return score(a) - score(b);
    });

    const leaguesToProcess = sorted.slice(0, LIMIT);

    for (const league of leaguesToProcess) {
      const res = await api.get(
        `/teams?league=${league.externalId}&season=${league.season}`
      );
      if (!Array.isArray(res.data.response)) {
        console.log(
          `⚠️ Resposta inesperada da API para liga ${league.externalId} - ${league.name}:`,
          res.data
        );
        continue;
      }

      const teams = res.data.response;
      console.log(
        `📊 Liga ${league.externalId} - ${league.name} (${league.country}) → ${teams.length} times encontrados`
      );

      for (const item of teams) {
        const { team, venue } = item;

        let venueId: number | null = null;
        if (venue?.id && venue.name) {
          const existingVenue = await prisma.venue.findUnique({
            where: { externalId: venue.id },
          });

          if (!existingVenue) {
            const venueImageUrl = await downloadAndUploadImage(
              venue.image,
              'logos/venues',
              `${venue.id}.png`
            );
            const savedVenue = await prisma.venue.create({
              data: {
                externalId: venue.id,
                name: venue.name,
                address: venue.address,
                city: venue.city,
                capacity: venue.capacity,
                surface: venue.surface,
                imageUrl: venueImageUrl,
              },
            });
            venueId = savedVenue.id;
          } else {
            venueId = existingVenue.id;
          }
        }

        const existingTeam = await prisma.team.findUnique({
          where: { externalId: team.id },
        });

        if (!existingTeam) {
          const logoUrl = await downloadAndUploadImage(
            team.logo,
            'logos/teams',
            `${team.id}.png`
          );
          const foundedYear =
            typeof team.founded === 'number' &&
            team.founded >= 1901 &&
            team.founded <= 2155
              ? team.founded
              : null;

          const savedTeam = await prisma.team.create({
            data: {
              externalId: team.id,
              name: team.name,
              code: team.code,
              country: team.country,
              founded: foundedYear,
              logoUrl,
              venueId,
            },
          });

          await prisma.teamLeague.upsert({
            where: {
              teamId_leagueId_season: {
                teamId: savedTeam.id,
                leagueId: league.id,
                season: league.season!,
              },
            },
            update: {},
            create: {
              teamId: savedTeam.id,
              leagueId: league.id,
              season: league.season!,
            },
          });
        }
      }

      await prisma.leagueImportLog.create({
        data: {
          leagueId: league.externalId,
          season: league.season,
        },
      });
    }

    console.log('✅ Times e estádios atualizados com logos.');
  } catch (err: any) {
    console.error(
      '❌ Erro ao buscar times:',
      err.response?.data || err.message
    );
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) fetchTeams();
