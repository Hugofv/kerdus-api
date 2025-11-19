import { PrismaClient } from '@prisma/client';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { IReq, IRes } from '../common/types';
import logger from 'jet-logger';
import { endOfDay, startOfDay } from 'date-fns';

interface IMatchesController {
  getAll(req: IReq, res: IRes): void;
  getById(req: IReq, res: IRes): void;
  getHighlights(req: IReq, res: IRes): void;
  getLastResults(req: IReq, res: IRes): void;
}

export class MatchesController implements IMatchesController {
  private _prisma;

  constructor({ prisma }: { prisma: PrismaClient }) {
    logger.info('MatchesController constructor called');
    this._prisma = prisma;
  }

  async getAll(req: IReq, res: IRes) {
    logger.info('getAllStates called');
    try {
      const { date, league, status, team } = req.query;

      const where: any = {};

      if (date) {
        const start = new Date(`${date}T00:00:00.000Z`);
        const end = new Date(`${date}T23:59:59.999Z`);
        where.date = { gte: start, lte: end };
      }

      if (league) where.leagueId = Number(league);
      if (status) where.statusShort = String(status);

      if (team) {
        where.OR = [{ homeTeamId: Number(team) }, { awayTeamId: Number(team) }];
      }

      const matches = await this._prisma.match.findMany({
        where,
        orderBy: { date: 'asc' },
        include: {
          homeTeam: true,
          awayTeam: true,
          league: true,
          venue: true,
          predictions: true,
        },
      });

      res.json(matches);
    } catch (error) {
      console.error('Erro ao buscar partidas:', error);
      res.status(500).json({ error: 'Erro ao buscar partidas' });
    }
  }

  async getById(req: IReq, res: IRes) {
    logger.info('getByIdMatch called');
    try {
      const matchId = Number(req.params.id);

      const match = await this._prisma.match.findUnique({
        where: { id: matchId },
        include: {
          homeTeam: true,
          awayTeam: true,
          league: true,
          venue: true,
          predictions: true,
        },
      });

      if (!match) {
        return res.status(404).json({ error: 'Partida não encontrada' });
      }

      res.json(match);
    } catch (error) {
      console.error('Erro ao buscar partida:', error);
      res.status(500).json({ error: 'Erro ao buscar partida' });
    }
  }

  async getHighlights(req: IReq, res: IRes) {
    logger.info('getHighlights called');
    try {
      const limit = Number(req.query.limit) || 10;
      const timeZone = 'America/Sao_Paulo';
      const zonedDate = toZonedTime(new Date(), timeZone);

      const matches = await this._prisma.match.findMany({
        where: {
          statusShort: {
            notIn: ['FT', 'AET', 'PEN'],
          },
          isHighlight: true,
          date: {
            gte: fromZonedTime(startOfDay(zonedDate), timeZone).toISOString(),
            lte: fromZonedTime(endOfDay(zonedDate), timeZone).toISOString(),
          },
        },
        orderBy: { relevanceScore: 'asc' },
        take: limit,
        include: {
          homeTeam: true,
          awayTeam: true,
          league: true,
          venue: true,
          predictions: true,
        },
      });

      res.json(matches);
    } catch (error) {
      console.error('Erro ao buscar highlights:', error);
      res.status(500).json({ error: 'Erro ao buscar highlights' });
    }
  }

  async getLastResults(req: IReq, res: IRes) {
    logger.info('getLastResults called');
    try {
      const limit = Number(req.query.limit) || 10;
      const matches = await this._prisma.match.findMany({
        where: {
          league: { featuredRank: { gt: 0 } },
          statusShort: {
            in: ['FT', 'AET', 'PEN'],
          },
        },
        orderBy: { date: 'desc' },
        take: limit,
        include: {
          homeTeam: true,
          awayTeam: true,
          league: true,
          venue: true,
          predictions: true,
        },
      });

      res.json(matches);
    } catch (error) {
      console.error('Erro ao buscar Últimos resultados:', error);
      res.status(500).json({ error: 'Erro ao buscar getLastResults' });
    }
  }
}
