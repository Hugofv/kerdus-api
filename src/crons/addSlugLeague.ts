import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
config(); // carrega variáveis do .env

const prisma = new PrismaClient();

export async function addSlugLeague() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const leagues = await prisma.league.findMany({});

  console.log(`${leagues.length} partidas encontradas criar os slugs.`);
  for (const league of leagues) {
    if (!league?.name) {
      console.log(`Skipping match ${league.id} due to missing required data`);
      continue;
    }

    const slug = `${slugify(league.name)}`.toLowerCase();

    await prisma.league.update({
      where: { id: league.id },
      data: { slug },
    });
    console.log(`Slug atualizado para partida ${league.id}: ${slug}`);
  }
}

if (require.main === module) addSlugLeague();
