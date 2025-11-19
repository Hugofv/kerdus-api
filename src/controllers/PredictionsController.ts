import { PrismaClient } from '@prisma/client';
import { IReq, IRes } from '../common/types';
import logger from 'jet-logger';

interface IPredictionsController {
  getById(req: IReq, res: IRes): void;
}

export class PredictionsController implements IPredictionsController {
  private _prisma;

  constructor({ prisma }: { prisma: PrismaClient }) {
    logger.info('PredictionsController constructor called');
    this._prisma = prisma;
  }

  async getById(req: IReq, res: IRes) {
    logger.info('getById called');
    try {
      const matchId = Number(req.params.id);

      const match = await this._prisma.prediction.findUnique({
        where: { matchId: matchId },
      });

      if (!match) {
        return res.status(404).json({ error: 'Palpite not found' });
      }

      res.json(match);
    } catch (error) {
      console.error('Error fetching match:', error);
      res.status(500).json({ error: 'Error fetching match' });
    }
  }
}
