/**
 * Operations Controller Tests (Skeleton)
 *
 * TODO: Install jest and @types/jest:
 * npm install --save-dev jest @types/jest ts-jest
 *
 * Add to package.json:
 * "jest": {
 *   "preset": "ts-jest",
 *   "testEnvironment": "node",
 *   "roots": ["<rootDir>/src"],
 * }
 */

import { OperationsController } from '../controllers/operationsController';
import { OperationsService } from '../services/operationsService';
import { IReq, IRes } from '../common/types';
import HttpStatusCodes from '../common/HttpStatusCodes';

// Mock the service
jest.mock('../services/operationsService');

describe('OperationsController', () => {
  let controller: OperationsController;
  let mockService: jest.Mocked<OperationsService>;
  let mockReq: Partial<IReq>;
  let mockRes: Partial<IRes>;

  beforeEach(() => {
    mockService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      registerPayment: jest.fn(),
      triggerAlert: jest.fn(),
    } as unknown as jest.Mocked<OperationsService>;

    controller = new OperationsController(mockService);

    mockReq = {
      params: {},
      query: {},
      body: {},
      user: { id: 1, role: 'owner' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as IRes;
  });

  describe('index', () => {
    it('should return paginated operations', async () => {
      const mockData = {
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
      mockService.findAll.mockResolvedValue(mockData);

      await controller.index(mockReq as IReq, mockRes as IRes);

      expect(mockService.findAll).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatusCodes.OK);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
      });
    });

    it('should filter by accountId and clientId', async () => {
      mockReq.query = { accountId: '1', clientId: '2' };
      const mockData = {
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
      mockService.findAll.mockResolvedValue(mockData);

      await controller.index(mockReq as IReq, mockRes as IRes);

      expect(mockService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        accountId: 1,
        clientId: 2,
        status: undefined,
        type: undefined,
      });
    });
  });

  describe('show', () => {
    it('should return operation by id', async () => {
      const mockOperation = {
        id: BigInt(1),
        accountId: 1,
        clientId: 1,
        type: 'LOAN',
        principalAmount: 1000,
        currency: 'BRL',
        startDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockService.findById.mockResolvedValue(mockOperation as any);
      mockReq.params = { id: '1' };

      await controller.show(mockReq as IReq, mockRes as IRes);

      expect(mockService.findById).toHaveBeenCalledWith(BigInt(1));
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatusCodes.OK);
    });

    it('should return 404 if operation not found', async () => {
      mockService.findById.mockResolvedValue(null);
      mockReq.params = { id: '999' };

      await controller.show(mockReq as IReq, mockRes as IRes);

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatusCodes.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Operation not found', code: 'NOT_FOUND' },
      });
    });
  });

  describe('create', () => {
    it('should create operation and generate installments', async () => {
      const mockOperation = {
        id: BigInt(1),
        accountId: 1,
        clientId: 1,
        type: 'LOAN',
        principalAmount: 1000,
        installments: 12,
        frequency: 'MONTHLY',
        installmentsList: [],
      };
      mockService.create.mockResolvedValue(mockOperation as any);
      mockReq.body = {
        accountId: 1,
        clientId: 1,
        type: 'LOAN',
        principalAmount: 1000,
        installments: 12,
        frequency: 'MONTHLY',
        startDate: '2024-01-01T00:00:00Z',
      };

      await controller.create(mockReq as IReq, mockRes as IRes);

      expect(mockService.create).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatusCodes.CREATED);
    });
  });

  describe('registerPayment', () => {
    it('should register payment for operation', async () => {
      const mockPayment = {
        id: BigInt(1),
        operationId: BigInt(1),
        clientId: 1,
        amount: 100,
        currency: 'BRL',
        paidAt: new Date(),
      };
      mockService.registerPayment.mockResolvedValue(mockPayment as any);
      mockReq.params = { id: '1' };
      mockReq.body = {
        amount: 100,
        method: 'PIX',
        clientId: 1,
      };

      await controller.registerPayment(mockReq as IReq, mockRes as IRes);

      expect(mockService.registerPayment).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatusCodes.CREATED);
    });
  });

  // TODO: Add more test cases for update, delete, triggerAlert
});

