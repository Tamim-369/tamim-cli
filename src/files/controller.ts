export default function addControllerFile(moduleName: string) {
  const capitalizedModuleName =
    moduleName[0].toUpperCase() + moduleName.slice(1);
  return `
import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { ${capitalizedModuleName}Service } from './${moduleName}.service';
// a controller function example
const getAll${capitalizedModuleName}s = catchAsync(async (req: Request, res: Response) => {
  const query: Record<string, any> = req.query;

  const result = await ${capitalizedModuleName}Service.getAll${capitalizedModuleName}s(query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: '${capitalizedModuleName} fetched successfully',
    data: result,
  });
});


export const ${capitalizedModuleName}Controller = {
    getAll${capitalizedModuleName}s
}
`;
}
