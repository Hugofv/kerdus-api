/**
 * Platform Users Controller
 */

import { IReq, IRes } from '../common/types';
import HttpStatusCodes from '../common/HttpStatusCodes';
import { PlatformUsersService } from '../services/platformUsers';
import { serializeBigInt } from '../utils/serializeBigInt';
import { parsePaginationParams } from '../utils/pagination';

export class PlatformUsersController {
  constructor(private platformUsersService: PlatformUsersService) {}

  async index(req: IReq, res: IRes): Promise<void> {
    const { page, limit } = parsePaginationParams(req.query);
    const role = req.query.role as string | undefined;
    const q = req.query.q as string | undefined;

    const result = await this.platformUsersService.findAll({ page, limit, role, q });
    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(result),
    });
  }

  async show(req: IReq, res: IRes): Promise<void> {
    const id = Number(req.params.id);
    const user = await this.platformUsersService.findById(id);

    if (!user) {
      res.status(HttpStatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: 'User not found', code: 'NOT_FOUND' },
      });
      return;
    }

    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(user),
    });
  }

  async create(req: IReq, res: IRes): Promise<void> {
    const user = await this.platformUsersService.create(req.body);
    res.status(HttpStatusCodes.CREATED).json({
      success: true,
      data: serializeBigInt(user),
    });
  }

  async update(req: IReq, res: IRes): Promise<void> {
    const id = Number(req.params.id);
    const user = await this.platformUsersService.update(id, req.body);
    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(user),
    });
  }

  async delete(req: IReq, res: IRes): Promise<void> {
    const id = Number(req.params.id);
    await this.platformUsersService.delete(id);
    res.status(HttpStatusCodes.NO_CONTENT).json({
      success: true,
    });
  }
}

