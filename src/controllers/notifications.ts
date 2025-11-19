/**
 * Notifications Controller
 */

import { IReq, IRes } from '../common/types';
import HttpStatusCodes from '../common/HttpStatusCodes';
import { NotificationsService } from '../services/notifications';
import { serializeBigInt } from '../utils/serializeBigInt';
import { parsePaginationParams } from '../utils/pagination';

export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  async index(req: IReq, res: IRes): Promise<void> {
    const { page, limit } = parsePaginationParams(req.query);
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    const read = req.query.read !== undefined ? req.query.read === 'true' : undefined;
    const channel = req.query.channel as string | undefined;

    const result = await this.notificationsService.findAll({ page, limit, userId, read, channel });
    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(result),
    });
  }

  async show(req: IReq, res: IRes): Promise<void> {
    const id = Number(req.params.id);
    const notification = await this.notificationsService.findById(id);

    if (!notification) {
      res.status(HttpStatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: 'Notification not found', code: 'NOT_FOUND' },
      });
      return;
    }

    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(notification),
    });
  }

  async create(req: IReq, res: IRes): Promise<void> {
    const notification = await this.notificationsService.create(req.body);
    res.status(HttpStatusCodes.CREATED).json({
      success: true,
      data: serializeBigInt(notification),
    });
  }

  async update(req: IReq, res: IRes): Promise<void> {
    const id = Number(req.params.id);
    const notification = await this.notificationsService.update(id, req.body);
    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(notification),
    });
  }

  async markAsRead(req: IReq, res: IRes): Promise<void> {
    const id = Number(req.params.id);
    const notification = await this.notificationsService.markAsRead(id);
    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: serializeBigInt(notification),
    });
  }

  async delete(req: IReq, res: IRes): Promise<void> {
    const id = Number(req.params.id);
    await this.notificationsService.delete(id);
    res.status(HttpStatusCodes.NO_CONTENT).json({
      success: true,
    });
  }
}

