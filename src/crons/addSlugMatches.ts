import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { format, parseISO } from 'date-fns';
config(); // carrega variáveis do .env

const prisma = new PrismaClient();

export async function addSlugMatches() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const matches = await prisma.match.findMany({
    where: {
      league: { featuredRank: { gt: 0 } },
    },
    orderBy: { date: 'desc' },
    include: {
      homeTeam: true,
      awayTeam: true,
    },
  });

  console.log(`${matches.length} partidas encontradas criar os slugs.`);
  for (const match of matches) {
    if (!match.homeTeam?.name || !match.awayTeam?.name || !match.date) {
      console.log(`Skipping match ${match.id} due to missing required data`);
      continue;
    }

    const slug = `${slugify(match.homeTeam.name)}-vs-${slugify(
      match.awayTeam.name
    )}-${format(match.date, 'yyyy-MM-dd')}`.toLowerCase();

    await prisma.match.update({
      where: { id: match.id },
      data: { slug },
    });
    console.log(`Slug atualizado para partida ${match.id}: ${slug}`);
  }
}

if (require.main === module) addSlugMatches();
