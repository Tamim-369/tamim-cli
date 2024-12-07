import { FileTypes } from "../enums/fileTypes";
import { IField } from "../types/field.type";

export const generateControllerTemplate = (
  name: string,
  capitalizedModuleName: string,
  fields: IField[],
  isExistFileField: boolean,
  fileFieldData: { fieldName: string; fieldType: string }[] | null
) => {
  const fileHandlingLogic = isExistFileField
    ? fileFieldData?.map((fileFieldData: any) => {
        return `
      if (req.files && '${
        fileFieldData?.fieldName
      }' in req.files && req.files.${fileFieldData?.fieldName}[0]) {
        req.body.${
          fileFieldData?.fieldName
        } = '/${fileFieldData?.fieldType.toLowerCase()}s/' + req.files.${
          fileFieldData?.fieldName
        }[0].filename;
      }
    `;
      })
    : "";

  return `
    import { Request, Response } from 'express';
    import catchAsync from '../../../shared/catchAsync';
    import sendResponse from '../../../shared/sendResponse';
    import { StatusCodes } from 'http-status-codes';
    import { ${capitalizedModuleName}Service } from './${name}.service';

    const create${capitalizedModuleName} = catchAsync(async (req: Request, res: Response) => {
      ${fileHandlingLogic}
      const result = await ${capitalizedModuleName}Service.create${capitalizedModuleName}(req.body);
      sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: '${capitalizedModuleName} created successfully',
        data: result,
      });
    });

    const getAll${capitalizedModuleName}s = catchAsync(async (req: Request, res: Response) => {
      const query = req.query;

      const result = await ${capitalizedModuleName}Service.getAll${capitalizedModuleName}s(query);
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
    ${fileHandlingLogic}
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
};
