/**
 * Resources Controller
 */

import { IReq, IRes } from '../common/types';
import HttpStatusCodes from '../common/HttpStatusCodes';
import { ResourcesService } from '../services/resources';
import { serializeBigInt } from '../utils/serializeBigInt';
import { parsePaginationParams } from '../utils/pagination';

export class ResourcesController {
  constructor(private resourcesService: ResourcesService) {}

  async index(req: IReq, res: IRes): Promise<void> {
    const { page, limit } = parsePaginationParams(req.query);
    const accountId = req.query.accountId ? Number(req.query.accountId) : undefined;
    const type = req.query.type as string | undefined;

    const result = await this.resourcesService.findAll({ page, limit, accountId, type });
    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(result),
    });
  }

  async show(req: IReq, res: IRes): Promise<void> {
    const id = Number(req.params.id);
    const resource = await this.resourcesService.findById(id);

    if (!resource) {
      res.status(HttpStatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: 'Resource not found', code: 'NOT_FOUND' },
      });
      return;
    }

    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(resource),
    });
  }

  async create(req: IReq, res: IRes): Promise<void> {
    const resource = await this.resourcesService.create(req.body);
    res.status(HttpStatusCodes.CREATED).json({
      success: true,
      data: serializeBigInt(resource),
    });
  }

  async update(req: IReq, res: IRes): Promise<void> {
    const id = Number(req.params.id);
    const resource = await this.resourcesService.update(id, req.body);
    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(resource),
    });
  }

  async delete(req: IReq, res: IRes): Promise<void> {
    const id = Number(req.params.id);
    await this.resourcesService.delete(id);
    res.status(HttpStatusCodes.NO_CONTENT).json({
      success: true,
    });
  }
}

