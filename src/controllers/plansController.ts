/**
 * Public Plans Controller
 * For clients to view available plans
 */

import { IReq, IRes } from '../common/types';
import { BaseController } from '../common/BaseController';
import { PlansService } from '../services/plansService';
import { serializeBigInt } from '../utils/serializeBigInt';
import { parsePaginationParams } from '../utils/pagination';
export class PlansController extends BaseController {
  private plansService: PlansService;
  
  constructor({ plansService }: { plansService: PlansService }) {
    super();
    this.plansService = plansService;
  }

  /**
   * Get public plans (for onboarding/plan selection)
   * GET /api/plans/public
   */
  async getPublic(req: IReq, res: IRes): Promise<void> {
    this.setResponse(res);
    const { page, limit } = parsePaginationParams(req.query);
    const result = await this.plansService.findAll({ 
      page, 
      limit, 
      isActive: true, 
      isPublic: true 
    });
    this.ok(serializeBigInt(result));
  }

  /**
   * Get recommended plans based on qualification
   * POST /api/plans/recommended
   */
  async getRecommended(req: IReq, res: IRes): Promise<void> {
    this.setResponse(res);
    const body = req.body as { answers?: Array<{ questionKey: string; answer: unknown }> };
    const answers = body.answers || [];
    const plans = await this.plansService.getRecommendedPlans(answers);
    this.ok(serializeBigInt(plans));
  }
}

