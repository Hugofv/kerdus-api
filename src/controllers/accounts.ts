/**
 * Accounts Controller
 */

import { IReq, IRes } from '../common/types';
import HttpStatusCodes from '../common/HttpStatusCodes';
import { AccountsService } from '../services/accounts';
import { serializeBigInt } from '../utils/serializeBigInt';
import { parsePaginationParams } from '../utils/pagination';

export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  async index(req: IReq, res: IRes): Promise<void> {
    const { page, limit } = parsePaginationParams(req.query);
    const q = req.query.q as string | undefined;
    const ownerId = req.query.ownerId ? Number(req.query.ownerId) : undefined;

    const result = await this.accountsService.findAll({ page, limit, q, ownerId });
    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(result),
    });
  }

  async show(req: IReq, res: IRes): Promise<void> {
    const id = Number(req.params.id);
    const account = await this.accountsService.findById(id);

    if (!account) {
      res.status(HttpStatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: 'Account not found', code: 'NOT_FOUND' },
      });
      return;
    }

    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(account),
    });
  }

  async create(req: IReq, res: IRes): Promise<void> {
    const account = await this.accountsService.create(req.body as any);
    res.status(HttpStatusCodes.CREATED).json({
      success: true,
      data: serializeBigInt(account),
    });
  }

  async update(req: IReq, res: IRes): Promise<void> {
    const id = Number(req.params.id);
    const account = await this.accountsService.update(id, req.body);
    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(account),
    });
  }

  async delete(req: IReq, res: IRes): Promise<void> {
    const id = Number(req.params.id);
    await this.accountsService.delete(id);
    res.status(HttpStatusCodes.NO_CONTENT).json({
      success: true,
    });
  }
}

