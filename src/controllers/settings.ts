/**
 * Settings Controller
 */

import { IReq, IRes } from '../common/types';
import HttpStatusCodes from '../common/HttpStatusCodes';
import { SettingsService } from '../services/settings';
import { serializeBigInt } from '../utils/serializeBigInt';
import { parsePaginationParams } from '../utils/pagination';

export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  async index(req: IReq, res: IRes): Promise<void> {
    const { page, limit } = parsePaginationParams(req.query);
    const accountId = req.query.accountId ? Number(req.query.accountId) : null;

    const result = await this.settingsService.findAll({ page, limit, accountId });
    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(result),
    });
  }

  async show(req: IReq, res: IRes): Promise<void> {
    const accountId = req.query.accountId ? Number(req.query.accountId) : null;
    const key = req.params.key;
    const setting = await this.settingsService.findByKey(accountId, key);

    if (!setting) {
      res.status(HttpStatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: 'Setting not found', code: 'NOT_FOUND' },
      });
      return;
    }

    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(setting),
    });
  }

  async create(req: IReq, res: IRes): Promise<void> {
    const setting = await this.settingsService.create(req.body);
    res.status(HttpStatusCodes.CREATED).json({
      success: true,
      data: serializeBigInt(setting),
    });
  }

  async update(req: IReq, res: IRes): Promise<void> {
    const accountId = req.body.accountId ? Number(req.body.accountId) : null;
    const key = req.params.key;
    const setting = await this.settingsService.update(accountId, key, req.body);
    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(setting),
    });
  }

  async upsert(req: IReq, res: IRes): Promise<void> {
    const accountId = req.body.accountId ? Number(req.body.accountId) : null;
    const key = req.params.key;
    const setting = await this.settingsService.upsert(accountId, key, req.body.value);
    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(setting),
    });
  }

  async delete(req: IReq, res: IRes): Promise<void> {
    const accountId = req.query.accountId ? Number(req.query.accountId) : null;
    const key = req.params.key;
    await this.settingsService.delete(accountId, key);
    res.status(HttpStatusCodes.NO_CONTENT).json({
      success: true,
    });
  }
}

