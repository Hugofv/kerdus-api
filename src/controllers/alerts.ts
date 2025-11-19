/**
 * Alerts Controller
 */

import { IReq, IRes } from '../common/types';
import HttpStatusCodes from '../common/HttpStatusCodes';
import { AlertsService } from '../services/alerts';
import { serializeBigInt } from '../utils/serializeBigInt';
import { parsePaginationParams } from '../utils/pagination';

export class AlertsController {
  constructor(private alertsService: AlertsService) {}

  async index(req: IReq, res: IRes): Promise<void> {
    const { page, limit } = parsePaginationParams(req.query);
    const operationId = req.query.operationId 
      ? BigInt(req.query.operationId as string) 
      : undefined;
    const enabled = req.query.enabled !== undefined 
      ? req.query.enabled === 'true' 
      : undefined;

    const result = await this.alertsService.findAll({ page, limit, operationId, enabled });
    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(result),
    });
  }

  async show(req: IReq, res: IRes): Promise<void> {
    const id = Number(req.params.id);
    const alert = await this.alertsService.findById(id);

    if (!alert) {
      res.status(HttpStatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: 'Alert not found', code: 'NOT_FOUND' },
      });
      return;
    }

    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(alert),
    });
  }

  async create(req: IReq, res: IRes): Promise<void> {
    const alert = await this.alertsService.create({
      ...req.body,
      operationId: BigInt(req.body.operationId),
    });
    res.status(HttpStatusCodes.CREATED).json({
      success: true,
      data: serializeBigInt(alert),
    });
  }

  async update(req: IReq, res: IRes): Promise<void> {
    const id = Number(req.params.id);
    const alert = await this.alertsService.update(id, req.body);
    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(alert),
    });
  }

  async delete(req: IReq, res: IRes): Promise<void> {
    const id = Number(req.params.id);
    await this.alertsService.delete(id);
    res.status(HttpStatusCodes.NO_CONTENT).json({
      success: true,
    });
  }
}

