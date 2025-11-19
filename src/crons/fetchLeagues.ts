import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { downloadAndUploadImage } from '../utils/imageUploader';
import slugify from 'slugify';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const prisma = new PrismaClient();

const api = axios.create({
  baseURL: 'https://v3.football.api-sports.io',
  headers: { 'x-apisports-key': process.env.API_KEY ?? '' },
});

export async function fetchLeagues() {
  try {
    const res = await api.get('/leagues');
    const leagues = res.data.response;

    for (const item of leagues) {
      const { league, country, seasons } = item;
      const season = seasons.find((s: any) => s.current);
      if (!season) continue;

      const logoUrl = await downloadAndUploadImage(
        league.logo,
        'logos/leagues',
        `${league.id}.png`
      );

      const slug = slugify(league.name).toLocaleLowerCase();

      await prisma.league.upsert({
        where: { externalId: league.id },
        update: {
          name: league.name,
          type: league.type,
          logoUrl,
          slug,
          country: country.name,
          season: season.year,
        },
        create: {
          externalId: league.id,
          name: league.name,
          type: league.type,
          logoUrl,
          country: country.name,
          season: season.year,
        },
      });
    }

    console.log(`✅ Ligas atualizadas com logos.`);
  } catch (err: any) {
    console.error(
      '❌ Erro ao buscar ligas:',
      err.response?.data || err.message
    );
  } finally {
    await prisma.$disconnect();
  }
}
if (require.main === module) fetchLeagues();