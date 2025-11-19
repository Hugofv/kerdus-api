/**
 * Payments Controller
 */

import { IReq, IRes } from '../common/types';
import HttpStatusCodes from '../common/HttpStatusCodes';
import { PaymentsService } from '../services/payments';
import { serializeBigInt } from '../utils/serializeBigInt';
import { parsePaginationParams } from '../utils/pagination';

export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  async index(req: IReq, res: IRes): Promise<void> {
    const { page, limit } = parsePaginationParams(req.query);
    const clientId = req.query.clientId ? Number(req.query.clientId) : undefined;
    const operationId = req.query.operationId 
      ? BigInt(String(req.query.operationId)) 
      : undefined;
    const from = req.query.from ? new Date(req.query.from as string) : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;

    const result = await this.paymentsService.findAll({
      page,
      limit,
      clientId,
      operationId,
      from,
      to,
    });
    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(result),
    });
  }

  async show(req: IReq, res: IRes): Promise<void> {
    const id = BigInt(req.params.id);
    const payment = await this.paymentsService.findById(id);

    if (!payment) {
      res.status(HttpStatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: 'Payment not found', code: 'NOT_FOUND' },
      });
      return;
    }

    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(payment),
    });
  }

  async create(req: IReq, res: IRes): Promise<void> {
    const payment = await this.paymentsService.create(req.body as any);
    res.status(HttpStatusCodes.CREATED).json({
      success: true,
      data: serializeBigInt(payment),
    });
  }
}

