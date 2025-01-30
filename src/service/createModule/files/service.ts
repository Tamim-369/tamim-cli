import { FileFieldData, IField } from "../../../types/field.type";
import { IOptions } from "../../../types/options.type";
import { serviceLogicHelper } from "../logicHelpers/serviceLogicHelper";

// templates/service.template.js
export const generateServiceTemplate = (
  name: string,
  capitalizedModuleName: string,
  fields: IField[],
  isExistFileField: boolean,
  fileFieldData: FileFieldData[] | null,
  options: IOptions
) => {
  const generateSearchFields = (fields: IField[]) => {
    return fields
      .map((field) => {
        if (!field.type.includes("string") && field.type !== "string") {
          return null;
        }
        return `{ ${field.name}: { $regex: search, $options: 'i' } }`;
      })
      .filter(Boolean)
      .join(",\n        ");
  };
  const skipFilter = options?.skip?.includes("filter");

  return `
  import { StatusCodes } from 'http-status-codes';
  import ApiError from '../../../errors/ApiError';
  import { ${capitalizedModuleName} } from './${name}.model';
  import { I${capitalizedModuleName} } from './${name}.interface';
  ${
    isExistFileField
      ? `
    import unlinkFile from '../../../shared/unlinkFile';
    `
      : ""
  }
  const create${capitalizedModuleName} = async (payload: I${capitalizedModuleName}): Promise<I${capitalizedModuleName}> => {
  
    const result = await ${capitalizedModuleName}.create(payload);
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create ${name}!');
    }
    return result;
  };
  
 ${
   skipFilter
     ? serviceLogicHelper.filterNotIncluded(capitalizedModuleName)
     : serviceLogicHelper.filterIncluded(
         capitalizedModuleName,
         generateSearchFields,
         fields
       )
 }
  
  
  const get${capitalizedModuleName}ById = async (id: string): Promise<I${capitalizedModuleName} | null> => {
    const result = await ${capitalizedModuleName}.findById(id);
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, '${capitalizedModuleName} not found!');
    }
    return result;
  };
  
  const update${capitalizedModuleName} = async (id: string, payload: I${capitalizedModuleName}): Promise<I${capitalizedModuleName} | null> => {
   
    const isExist${capitalizedModuleName} = await get${capitalizedModuleName}ById(id);
    if (!isExist${capitalizedModuleName}) {
      throw new ApiError(StatusCodes.BAD_REQUEST, '${capitalizedModuleName} not found!');
    }
    ${
      isExistFileField
        ? fileFieldData
            ?.map((fileFieldData: any) => {
              return `if (typeof isExist${capitalizedModuleName}.${fileFieldData?.fieldName} === 'string' && typeof payload.${fileFieldData?.fieldName} === 'string') {
          await unlinkFile(isExist${capitalizedModuleName}.${fileFieldData?.fieldName});
        }`;
            })
            .toString()
            .replace(/,/g, "\n")
        : ""
    }
    const result = await ${capitalizedModuleName}.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update ${name}!');
    }
    return result;
  };
  
  const delete${capitalizedModuleName} = async (id: string): Promise<I${capitalizedModuleName} | null> => {
    const isExist${capitalizedModuleName} = await get${capitalizedModuleName}ById(id);
    if (!isExist${capitalizedModuleName}) {
      throw new ApiError(StatusCodes.BAD_REQUEST, '${capitalizedModuleName} not found!');
    }
        ${
          isExistFileField
            ? fileFieldData
                ?.map((fileFieldData: any) => {
                  return `
          if (typeof isExist${capitalizedModuleName}.${fileFieldData?.fieldName} === 'string') {
           await unlinkFile(isExist${capitalizedModuleName}.${fileFieldData?.fieldName});
         }
         `;
                })
                .toString()
                .replace(/,/g, "\n")
            : ""
        }
    const result = await ${capitalizedModuleName}.findByIdAndDelete(id);
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete ${name}!');
    }
    return result;
  };
  
  export const ${capitalizedModuleName}Service = {
    create${capitalizedModuleName},
    getAll${capitalizedModuleName}s,
    get${capitalizedModuleName}ById,
    update${capitalizedModuleName},
    delete${capitalizedModuleName},
  };
  `;
};
