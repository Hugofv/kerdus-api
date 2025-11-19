/**
 * Clients Controller
 */

import { IReq, IRes } from '../common/types';
import HttpStatusCodes from '../common/HttpStatusCodes';
import { ClientsService } from '../services/clients';
import { serializeBigInt } from '../utils/serializeBigInt';
import { parsePaginationParams } from '../utils/pagination';

export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  async index(req: IReq, res: IRes): Promise<void> {
    const { page, limit } = parsePaginationParams(req.query);
    const accountId = req.query.accountId ? Number(req.query.accountId) : undefined;
    const q = req.query.q as string | undefined;

    const result = await this.clientsService.findAll({ page, limit, accountId, q });
    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(result),
    });
  }

  async show(req: IReq, res: IRes): Promise<void> {
    const id = Number(req.params.id);
    const client = await this.clientsService.findById(id);

    if (!client) {
      res.status(HttpStatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: 'Client not found', code: 'NOT_FOUND' },
      });
      return;
    }

    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(client),
    });
  }

  async create(req: IReq, res: IRes): Promise<void> {
    const client = await this.clientsService.create(req.body);
    res.status(HttpStatusCodes.CREATED).json({
      success: true,
      data: serializeBigInt(client),
    });
  }

  async update(req: IReq, res: IRes): Promise<void> {
    const id = Number(req.params.id);
    const client = await this.clientsService.update(id, req.body);
    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(client),
    });
  }

  async delete(req: IReq, res: IRes): Promise<void> {
    const id = Number(req.params.id);
    await this.clientsService.delete(id);
    res.status(HttpStatusCodes.NO_CONTENT).json({
      success: true,
    });
  }
}

