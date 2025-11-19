import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { wasSyncedToday, markSync } from '../utils/syncLog';
import Groq from 'groq-sdk';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const api = axios.create({
  baseURL: 'https://v3.football.api-sports.io',
  headers: {
    'x-apisports-key': process.env.API_KEY ?? '',
  },
});

export async function fetchPredictions() {
  try {
    const matches = await prisma.match.findMany({
      where: {
        date: {
          gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // últimos 3 dias
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
      const scope = `prediction-${match.id}`;
      if (await wasSyncedToday('prediction', prisma, scope)) {
        console.log(`⏭️ Palpite já sincronizado para match ${match.id}`);
        continue;
      }

      const res = await api.get('/predictions', {
        params: { fixture: match.externalId },
      });

      const pred = res.data.response?.[0]?.predictions;
      if (!pred) continue;

      const prompt = `Traduza para português a seguinte frase usada em contexto de aposta esportiva, mantendo a linguagem mais comum em sites de apostas brasileiros. Retorne **somente a frase traduzida**, sem explicações, exemplos ou comentários:
:

    "${pred.advice}"`;

    const chatCompletion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
    });

      const data = {
        matchId: match.id,
        winner: pred.winner?.name || null,
        advice: chatCompletion.choices[0].message.content?.replace(/"/g, '') || null,
        percentHome: pred.percent?.home || null,
        percentDraw: pred.percent?.draw || null,
        percentAway: pred.percent?.away || null,
        goalsHome: pred.goals?.home || null,
        goalsAway: pred.goals?.away || null,
        winOrDraw: pred.win_or_draw ?? null,
        comparison: res.data.response?.[0]?.comparison || null,
        h2h: res.data.response?.[0]?.h2h || null,
      };

      const existing = await prisma.prediction.findUnique({
        where: { matchId: match.id },
      });

      if (!existing) {
        await prisma.prediction.create({ data });
        totalNew++;
      } else {
        await prisma.prediction.update({
          where: { matchId: match.id },
          data,
        });
        totalUpdated++;
      }

      await markSync('prediction', prisma, scope);
      console.log(`✅ Palpite salvo para match ${match.id}`);
    }

    console.log(
      `🎯 Predictions: ${totalNew} novos, ${totalUpdated} atualizados`
    );
  } catch (error: any) {
    console.error(
      '❌ Erro ao importar predictions:',
      error.response?.data || error.message
    );
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) fetchPredictions();
