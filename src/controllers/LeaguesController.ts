import { PrismaClient } from '@prisma/client';
import { IReq, IRes } from '../common/types';
import logger from 'jet-logger';

interface ILeaguesController {
  getAll(req: IReq, res: IRes): void;
  getFeatured(req: IReq, res: IRes): void;
  getBySlug(req: IReq, res: IRes): void;
}

export class LeaguesController implements ILeaguesController {
  private _prisma;

  constructor({ prisma }: { prisma: PrismaClient }) {
    logger.info('StandingController constructor called');
    this._prisma = prisma;
  }

  async getAll(req: IReq, res: IRes) {
    logger.info('getById called');
    try {
      const leagues = await this._prisma.league.findMany({
        orderBy: { featuredRank: 'asc' },
      });

      res.json(leagues);
    } catch (error) {
      console.error('Erro ao buscar ligas em destaque:', error);
      res.status(400).json({ error: 'Erro ao buscar ligas em destaque' });
    }
  }

  async getFeatured(req: IReq, res: IRes) {
    logger.info('getById called');
    try {
      const leagues = await this._prisma.league.findMany({
        where: {
          featuredRank: { gt: 0 },
        },
        orderBy: { featuredRank: 'asc' },
      });

      res.json(leagues);
    } catch (error) {
      console.error('Erro ao buscar ligas em destaque:', error);
      res.status(400).json({ error: 'Erro ao buscar ligas em destaque' });
    }
  }

  async getBySlug(req: IReq, res: IRes) {
    logger.info('getBySlug called');
    try {
      const leagues = await this._prisma.league.findFirstOrThrow({
        where: {
          slug: { equals: req.params.slug as string },
        },
        include: {
          matches: {
            include: {
              homeTeam: true,
              awayTeam: true,
              venue: true,
            },
            orderBy: {
              date: 'asc',
            },
          },
          scorers: true,
          standing: {
            include: {
              team: true,
            },
          },
        },
      });

      res.json(leagues);
    } catch (error) {
      console.error('Erro ao buscar liga por slug:', error);
      res.status(400).json({ error: 'Erro ao buscar ligas por slug' });
    }
  }
}
