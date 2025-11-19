import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import Groq from 'groq-sdk';

config(); // carrega variáveis do .env

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function addTranslationPrediction() {
  const predictions = await prisma.prediction.findMany({
    orderBy: { match: { date: 'desc' } },
    include: {
      match: true,
    },
    where: {
      matchId: {
        notIn: [756, 757]
      }
    },
  });

  console.log(`${predictions.length} previsões encontradas para tradução.`);
  for (const prediction of predictions) {
    if (!prediction.advice) {
      console.log(
        `Skipping previsões ${prediction.matchId} due to missing required data`
      );
      continue;
    }
    const prompt = `Traduza para português se preciso a seguinte frase usada em contexto de aposta esportiva, mantendo a linguagem mais comum em sites de apostas brasileiros. Retorne **somente a frase traduzida**, sem explicações, exemplos ou comentários:
:

    "${prediction.advice}"`;

    const chatCompletion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
    });

    await prisma.prediction.update({
      where: { matchId: prediction.matchId },
      data: { advice: chatCompletion.choices[0].message.content?.replace(/"/g, '') },
    });
    console.log(
      `Previsão ${prediction.matchId} traduzida com sucesso: ${chatCompletion.choices[0].message.content?.replace(/"/g, '')}`
    );
  }
}

if (require.main === module) addTranslationPrediction();
