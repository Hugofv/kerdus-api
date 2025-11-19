import { Prisma } from '@prisma/client';

type MatchWithRelations = Prisma.MatchGetPayload<{
  include: {
    league: true;
    homeTeam: true;
    awayTeam: true;
    venue: true;
    predictions: true;
  };
}>;

export function promptMatchRelevance(match: MatchWithRelations) {
  return `
 Avalie a relevância da seguinte partida de futebol para apostadores:
 
 Campeonato: ${match.league?.name}
 Times: ${match.homeTeam?.name} vs ${match.awayTeam?.name}
 Horário: ${match.date?.toISOString()}
 Odds: Casa ${match.predictions?.[0]?.percentHome}, Empate ${
    match.predictions?.[0]?.percentDraw
  }, Fora ${match.predictions?.[0]?.percentAway}
 
 Dê uma nota de 0 a 10 e uma justificativa curta (máximo 1 linha).
 Formato: NOTA - Justificativa`;
}
