import { PrismaClient } from '@prisma/client';
import { IReq, IRes } from '../common/types';
import logger from 'jet-logger';

interface IStandingController {
  getById(req: IReq, res: IRes): void;
}

export class StandingController implements IStandingController {
  private _prisma;

  constructor({ prisma }: { prisma: PrismaClient }) {
    logger.info('StandingController constructor called');
    this._prisma = prisma;
  }

  async getById(req: IReq, res: IRes) {
    logger.info('getById called');
    try {
      const leagueId = Number(req.query.league);
      const season = Number(req.query.season);

      if (!leagueId || !season) {
        return res
          .status(400)
          .json({ error: 'Parâmetros league e season são obrigatórios.' });
      }

      const standings = await this._prisma.standing.findMany({
        where: {
          leagueId,
          season,
        },
        orderBy: { rank: 'asc' },
        include: { team: true },
      });

      res.json(standings);
    } catch (error) {
      console.error('Erro ao buscar classificação:', error);
      res.status(500).json({ error: 'Erro ao buscar classificação' });
    }
  }
}
