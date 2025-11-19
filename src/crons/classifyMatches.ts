import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import Groq from 'groq-sdk';

import { promptMatchRelevance } from '../utils/promptMatchRelevance';

config(); // carrega variáveis do .env

const prisma = new PrismaClient();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// const client = new OpenAI({
//   base_url="https://openrouter.ai/api/v1",
//   apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
// });

export async function classifyMatches() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const matches = await prisma.match.findMany({
    where: {
      league: { featuredRank: { gt: 0 } },
      statusShort: {
        notIn: ['FT', 'AET', 'PEN'],
      },
      date: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
        lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    },
    include: {
      league: true,
      homeTeam: true,
      awayTeam: true,
      venue: true,
      predictions: true,
    },
  });

  const scored = [];

  console.log(`${matches.length} partidas encontradas para classificação.`);
  for (const match of matches) {
    const prompt = promptMatchRelevance(match);
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
    });
    if (!completion.choices || completion.choices.length === 0) {
      console.error(`Erro ao gerar resposta para a partida ${match.id}`);
      continue;
    }

    const text = completion.choices[0].message?.content?.trim();
    if (!text) continue;

    const [scoreStr, note] = text.split(' - ');
    const score = parseFloat(scoreStr);

    if (!isNaN(score)) {
      await prisma.match.update({
        where: { id: match.id },
        data: {
          relevanceScore: score,
          highlightNote: note,
        },
      });
      scored.push({ id: match.id, score });
    }
  }

  const top10 = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((m) => m.id);

  await prisma.match.updateMany({ data: { isHighlight: false } });
  await prisma.match.updateMany({
    where: { id: { in: top10 } },
    data: { isHighlight: true },
  });

  console.log(`[${new Date().toISOString()}] Partidas destacadas:`, top10);
}

if (require.main === module) classifyMatches();
