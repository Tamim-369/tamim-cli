export const generateControllerTemplate = (
  name: string,
  capitalizedModuleName: string
) => `
  import { Request, Response } from 'express';
  import catchAsync from '../../../shared/catchAsync';
  import sendResponse from '../../../shared/sendResponse';
  import { StatusCodes } from 'http-status-codes';
  import { ${capitalizedModuleName}Service } from './${name}.service';
  
  const create${capitalizedModuleName} = catchAsync(async (req: Request, res: Response) => {
    const result = await ${capitalizedModuleName}Service.create${capitalizedModuleName}(req.body);
    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: '${capitalizedModuleName} created successfully',
      data: result,
    });
  });
  
  const getAll${capitalizedModuleName}s = catchAsync(async (req: Request, res: Response) => {
    const search: any = req.query.search || '';
    const page = req.query.page || null;
    const limit = req.query.limit || null;
  
    const result = await ${capitalizedModuleName}Service.getAll${capitalizedModuleName}s(search as string, page as number | null, limit as number | null);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: '${capitalizedModuleName}s fetched successfully',
      data: result,
    });
  });
  
  const get${capitalizedModuleName}ById = catchAsync(async (req: Request, res: Response) => {
    const result = await ${capitalizedModuleName}Service.get${capitalizedModuleName}ById(req.params.id);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: '${capitalizedModuleName} fetched successfully',
      data: result,
    });
  });
  
  const update${capitalizedModuleName} = catchAsync(async (req: Request, res: Response) => {
    const result = await ${capitalizedModuleName}Service.update${capitalizedModuleName}(req.params.id, req.body);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: '${capitalizedModuleName} updated successfully',
      data: result,
    });
  });
  
  const delete${capitalizedModuleName} = catchAsync(async (req: Request, res: Response) => {
    const result = await ${capitalizedModuleName}Service.delete${capitalizedModuleName}(req.params.id);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: '${capitalizedModuleName} deleted successfully',
      data: result,
    });
  });
  
  export const ${capitalizedModuleName}Controller = {
    create${capitalizedModuleName},
    getAll${capitalizedModuleName}s,
    get${capitalizedModuleName}ById,
    update${capitalizedModuleName},
    delete${capitalizedModuleName},
  };
  `;
