/**
 * Operations Controller
 */

import { IReq, IRes } from '../common/types';
import HttpStatusCodes from '../common/HttpStatusCodes';
import { OperationsService } from '../services/operations';
import { serializeBigInt } from '../utils/serializeBigInt';
import { parsePaginationParams } from '../utils/pagination';

export class OperationsController {
  constructor(private operationsService: OperationsService) {}

  async index(req: IReq, res: IRes): Promise<void> {
    const { page, limit } = parsePaginationParams(req.query);
    const accountId = req.query.accountId ? Number(req.query.accountId) : undefined;
    const clientId = req.query.clientId ? Number(req.query.clientId) : undefined;
    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;

    const result = await this.operationsService.findAll({
      page,
      limit,
      accountId,
      clientId,
      status,
      type,
    });
    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(result),
    });
  }

  async show(req: IReq, res: IRes): Promise<void> {
    const id = BigInt(req.params.id);
    const operation = await this.operationsService.findById(id);

    if (!operation) {
      res.status(HttpStatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: 'Operation not found', code: 'NOT_FOUND' },
      });
      return;
    }

    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(operation),
    });
  }

  async create(req: IReq, res: IRes): Promise<void> {
    const operation = await this.operationsService.create(req.body);
    res.status(HttpStatusCodes.CREATED).json({
      success: true,
      data: serializeBigInt(operation),
    });
  }

  async update(req: IReq, res: IRes): Promise<void> {
    const id = BigInt(req.params.id);
    const operation = await this.operationsService.update(id, req.body);
    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(operation),
    });
  }

  async delete(req: IReq, res: IRes): Promise<void> {
    const id = BigInt(req.params.id);
    await this.operationsService.delete(id);
    res.status(HttpStatusCodes.NO_CONTENT).json({
      success: true,
    });
  }

  async registerPayment(req: IReq, res: IRes): Promise<void> {
    const operationId = BigInt(req.params.id);
    const clientId = req.user?.accountId || req.body.clientId;
    
    if (!clientId) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        success: false,
        error: { message: 'Client ID is required', code: 'VALIDATION_ERROR' },
      });
      return;
    }

    const payment = await this.operationsService.registerPayment(operationId, {
      amount: req.body.amount,
      method: req.body.method,
      installmentId: req.body.installmentId ? BigInt(req.body.installmentId) : undefined,
      clientId: Number(clientId),
      reference: req.body.reference,
      meta: req.body.meta,
    });

    res.status(HttpStatusCodes.CREATED).json({
      success: true,
      data: serializeBigInt(payment),
    });
  }

  async triggerAlert(req: IReq, res: IRes): Promise<void> {
    const operationId = BigInt(req.params.id);
    const alert = await this.operationsService.triggerAlert(operationId, {
      type: req.body.type,
      template: req.body.template,
      sendAt: req.body.sendAt ? new Date(req.body.sendAt) : undefined,
    });

    res.status(HttpStatusCodes.CREATED).json({
      success: true,
      data: serializeBigInt(alert),
    });
  }
}

