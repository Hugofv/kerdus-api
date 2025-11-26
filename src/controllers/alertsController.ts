/**
 * Alerts Controller
 */

import { IReq, IRes } from '../common/types';
import { BaseController } from '../common/BaseController';
import { AlertsService } from '../services/alertsService';
import { serializeBigInt } from '../utils/serializeBigInt';
import { parsePaginationParams } from '../utils/pagination';
export class AlertsController extends BaseController {
  private alertsService: AlertsService;
  
  constructor({ alertsService }: { alertsService: AlertsService }) {
    super();
    this.alertsService = alertsService;
  }

  async index(req: IReq, res: IRes): Promise<void> {
    this.setResponse(res);
    const { page, limit } = parsePaginationParams(req.query);
    const operationId = req.query.operationId 
      ? BigInt(req.query.operationId as string) 
      : undefined;
    const enabled = req.query.enabled !== undefined 
      ? req.query.enabled === 'true' 
      : undefined;

    const result = await this.alertsService.findAll({ page, limit, operationId, enabled });
    this.ok(serializeBigInt(result));
  }

  async show(req: IReq, res: IRes): Promise<void> {
    this.setResponse(res);
    const id = Number(req.params.id);
    const alert = await this.alertsService.findById(id);

    if (!alert) {
      this.notFound('Alert not found');
      return;
    }

    this.ok(serializeBigInt(alert));
  }

  async create(req: IReq, res: IRes): Promise<void> {
    this.setResponse(res);
    const body = req.body as any;
    const alert = await this.alertsService.create({
      ...body,
      operationId: BigInt(String(body.operationId)),
    });
    this.created(serializeBigInt(alert));
  }

  async update(req: IReq, res: IRes): Promise<void> {
    this.setResponse(res);
    const id = Number(req.params.id);
    const alert = await this.alertsService.update(id, req.body as any);
    this.ok(serializeBigInt(alert));
  }

  async delete(req: IReq, res: IRes): Promise<void> {
    this.setResponse(res);
    const id = Number(req.params.id);
    await this.alertsService.delete(id);
    this.noContent();
  }
}

