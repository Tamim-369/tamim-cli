import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { RandomService } from './random.service';

const createRandom = catchAsync(async (req: Request, res: Response) => {
  const result = await RandomService.createRandom(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Random created successfully',
    data: result,
  });
});

const getAllRandoms = catchAsync(async (req: Request, res: Response) => {
  const search: any = req.query.search || '';
  const page = req.query.page || null;
  const limit = req.query.limit || null;

  const result = await RandomService.getAllRandoms(search as string, page as number | null, limit as number | null);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Randoms fetched successfully',
    data: result,
  });
});

const getRandomById = catchAsync(async (req: Request, res: Response) => {
  const result = await RandomService.getRandomById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Random fetched successfully',
    data: result,
  });
});

const updateRandom = catchAsync(async (req: Request, res: Response) => {
  const result = await RandomService.updateRandom(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Random updated successfully',
    data: result,
  });
});

const deleteRandom = catchAsync(async (req: Request, res: Response) => {
  const result = await RandomService.deleteRandom(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Random deleted successfully',
    data: result,
  });
});

export const RandomController = {
  createRandom,
  getAllRandoms,
  getRandomById,
  updateRandom,
  deleteRandom,
};
