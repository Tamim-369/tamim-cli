export default function addServiceFile(moduleName: string) {
  const capitalizedModuleName =
    moduleName[0].toUpperCase() + moduleName.slice(1);
  return `
    import { StatusCodes } from 'http-status-codes';
  import ApiError from '../../../errors/ApiError';
  import { ${capitalizedModuleName} } from './${moduleName}.model';
  import { I${capitalizedModuleName} } from './${moduleName}.interface';
   const create${capitalizedModuleName} = async (payload: I${capitalizedModuleName}): Promise<I${capitalizedModuleName}> => {
    const result = await ${capitalizedModuleName}.create(payload);
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create ${moduleName}!');
    }
    return result;
  };
    export const ${capitalizedModuleName}Service = {
    create${capitalizedModuleName}
  };
    `;
}
