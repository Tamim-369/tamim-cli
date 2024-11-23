const { program } = require('commander');
const fs = require('fs');
const axios = require('axios');
const { automatePostman } = require('./createModulePostman');

const generateRouteTemplate = (name, capitalizedModuleName) => `
import express from 'express';
import { ${capitalizedModuleName}Controller } from './${name}.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ${capitalizedModuleName}Validation } from './${name}.validation';

const router = express.Router();

router.post(
  '/create',
  // change the role according to your preferences
  // auth(USER_ROLES.ADMIN),
  validateRequest(${capitalizedModuleName}Validation.create${capitalizedModuleName}ZodSchema),
  ${capitalizedModuleName}Controller.create${capitalizedModuleName}
);
router.get('/', ${capitalizedModuleName}Controller.getAll${capitalizedModuleName}s);
router.get('/:id', ${capitalizedModuleName}Controller.get${capitalizedModuleName}ById);
router.patch(
  '/:id',
  // change the role according to your preferences
  // auth(USER_ROLES.ADMIN),
  validateRequest(${capitalizedModuleName}Validation.update${capitalizedModuleName}ZodSchema),
  ${capitalizedModuleName}Controller.update${capitalizedModuleName}
);
router.delete('/:id', auth(USER_ROLES.ADMIN), ${capitalizedModuleName}Controller.delete${capitalizedModuleName});

export const ${capitalizedModuleName}Routes = router;
`;
// templates/model.template.js
const generateModelTemplate = (name, capitalizedModuleName, fields) => {
  const generateSchemaFields = fields => {
    return fields
      .map(field => {
        if (field.type.includes('array') && !field.type.includes('ref')) {
          return `${field.name}: {type: [${field.type
            .split('=>')[1]
            .replace(
              field.type.split('=>')[1][0],
              field.type.split('=>')[1][0].toUpperCase()
            )}], required: ${field.isRequired} }`;
        }

        if (field.type.includes('ref')) {
          if (field.type.includes('array=>ref')) {
            return `${field.name}: {
              type: [{ type: Schema.Types.ObjectId, ref: '${
                field.type.split('ref=>')[1]
              }'},],
              required: ${field.isRequired}
            }`;
          }
          return `${field.name}: { type: Schema.Types.ObjectId, ref: '${
            field.type.split('=>')[1]
          }', required: ${field.isRequired} }`;
        }

        return `${field.name}: { type: ${field.type.replace(
          field.type[0],
          field.type[0].toUpperCase()
        )}, required: ${field.isRequired} }`;
      })
      .join(',\n  ');
  };

  return `
import { Schema, model } from 'mongoose';
import { I${capitalizedModuleName}, ${capitalizedModuleName}Model } from './${name}.interface';

const ${name}Schema = new Schema<I${capitalizedModuleName}, ${capitalizedModuleName}Model>({
  ${generateSchemaFields(fields)}
}, { timestamps: true });

export const ${capitalizedModuleName} = model<I${capitalizedModuleName}, ${capitalizedModuleName}Model>('${capitalizedModuleName}', ${name}Schema);
`;
};

// templates/interface.template.js
const generateInterfaceTemplate = (name, capitalizedModuleName, fields) => {
  const generateFieldTypes = fields => {
    return fields
      .map(field => {
        fieldname = `${field.name}${field.isRequired ? '' : '?'}`;
        if (field.type.includes('ref')) {
          return `${fieldname}: ${
            field.type.includes('array=>ref=>')
              ? '[Types.ObjectId]'
              : 'Types.ObjectId'
          }`;
        }
        if (field.type === 'date') return `${fieldname}: Date`;
        if (field.type.includes('array')) {
          const baseType = field.type.split('=>')[1];
          return `${fieldname}: Array<${
            baseType.includes('ref')
              ? 'Types.ObjectId'
              : baseType.includes('date')
              ? 'Date'
              : baseType
          }>`;
        }
        return `${fieldname}: ${field.type}`;
      })
      .join(';\n  ');
  };

  return `
import { Model, Types } from 'mongoose';

export type I${capitalizedModuleName} = {
  ${generateFieldTypes(fields)}
};

export type ${capitalizedModuleName}Model = Model<I${capitalizedModuleName}>;
`;
};

// templates/service.template.js
const generateServiceTemplate = (name, capitalizedModuleName, fields) => {
  const generateSearchFields = fields => {
    return fields
      .map(field => {
        if (!field.type.includes('string') && !field.type === 'string') {
          return null;
        }
        return `{ ${field.name}: { $regex: search, $options: 'i' } }`;
      })
      .filter(Boolean)
      .join(',\n        ');
  };

  return `
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ${capitalizedModuleName} } from './${name}.model';
import { I${capitalizedModuleName} } from './${name}.interface';

const create${capitalizedModuleName} = async (payload: I${capitalizedModuleName}): Promise<I${capitalizedModuleName}> => {
  const result = await ${capitalizedModuleName}.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create ${name}!');
  }
  return result;
};

const getAll${capitalizedModuleName}s = async (search: string, page: number | null, limit: number | null): Promise<I${capitalizedModuleName}[]> => {
  const query = search ? { $or: [${generateSearchFields(fields)}] } : {};
  let queryBuilder = ${capitalizedModuleName}.find(query);

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  }

  return await queryBuilder;
};


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

// templates/validation.template.js
const generateValidationTemplate = (name, capitalizedModuleName, fields) => {
  const generateCreateValidationFields = fields => {
    return fields
      .map(field => {
        if (field.type.includes('array=>ref=>')) {
          return `${field.name}: z.array(z.string({${
            field.isRequired === true
              ? `required_error:"${field.name} is required",`
              : ''
          } invalid_type_error:"${
            field.name
          } array item should have type string" })${
            field.isRequired === false ? `.optional()` : ''
          })`;
        }
        if (field.type.includes('array')) {
          return `${field.name}: z.array(z.${field.type.split('=>')[1]}({ ${
            field.isRequired === true
              ? `required_error:"${field.name} is required",`
              : ''
          } invalid_type_error:"${field.name} array item should have type ${
            field.type.split('=>')[1]
          }" })${field.isRequired === false ? `.optional()` : ''})`;
        }
        return `${field.name}: z.${
          field.type.includes('ref') ? 'string' : field.type
        }({ ${
          field.isRequired &&
          `required_error:"${
            field.name === 'Date' ? 'date' : field.name
          } is required",`
        } invalid_type_error:"${field.name} should be type ${
          field.type.includes('ref') ? 'objectID or string' : field.type
        }" })`;
      })
      .join(',\n      ');
  };

  const generateUpdateValidationFields = fields => {
    return fields
      .map(field => {
        if (field.type.includes('array=>ref=>')) {
          return `${field.name}: z.array(z.string({ invalid_type_error:"${field.name} array item should have type string" })).optional()`;
        }
        if (field.type.includes('array')) {
          return `${field.name}: z.array(z.${
            field.type.split('=>')[1]
          }({ invalid_type_error:"${field.name} array item should have type ${
            field.type.includes('array=>ref=>')
              ? 'string'
              : field.type.split('=>')[1]
          }" })).optional()`;
        }
        if (field.type.includes('ref') && !field.type.includes('array')) {
          console.log(true);
          return `${field.name}: z.string({ invalid_type_error:"${field.name} should be type string" }).optional()`;
        }
        return `${field.name}: z.${
          field.type.includes('ref') ? 'string' : field.type
        }({ invalid_type_error:"${field.name} should be type ${
          field.type.includes('ref=>') ? 'objectID or string' : field.type
        }" }).optional()`;
      })
      .join(',\n      ');
  };

  return `import { z } from 'zod';
      
const create${capitalizedModuleName}ZodSchema = z.object({
  body: z.object({
    ${generateCreateValidationFields(fields)}
  }),
});

const update${capitalizedModuleName}ZodSchema = z.object({
  body: z.object({
    ${generateUpdateValidationFields(fields)}
  }),
});

export const ${capitalizedModuleName}Validation = {
  create${capitalizedModuleName}ZodSchema,
  update${capitalizedModuleName}ZodSchema
};`;
};

// templates/controller.template.js
const generateControllerTemplate = (name, capitalizedModuleName) => `
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

// File generator configuration
const fileGenerators = {
  'route.ts': generateRouteTemplate,
  'controller.ts': generateControllerTemplate,
  'service.ts': generateServiceTemplate,
  'validation.ts': generateValidationTemplate,
  'interface.ts': generateInterfaceTemplate,
  'model.ts': generateModelTemplate,
};

const generateFileContent = (
  fileType,
  name,
  capitalizedModuleName,
  exportName,
  fields
) => {
  const generator = fileGenerators[`${fileType}.ts`];
  if (!generator) {
    return `// Define your ${fileType} logic here\nexport const ${exportName} = {};`;
  }
  return generator(name, capitalizedModuleName, fields);
};
process.stdin.isTTY = false;
process.stdout.isTTY = false;
const createModule = async (name, fields) => {
  try {
    const parsedFields = fields.map(field => {
      const [fieldName, fieldType] = field.includes('?:')
        ? field.replace('?:', ':').split(':')
        : field.split(':');

      if (!fieldName || !fieldType) {
        throw new Error(
          `Invalid field format: ${field}. Expected format: name:type`
        );
      }
      return {
        name: fieldName,
        type: fieldType,
        isRequired: field.toString().includes('?') ? false : true,
      };
    });
    const generateRandomString = () =>
      Math.random().toString(36).substring(2, 15); // Generates a random string

    const postmanFields = parsedFields.reduce((acc, field) => {
      let value;

      switch (field.type) {
        case 'string':
          field.name.includes('email')
            ? (value = 'name@company.com')
            : (value = 'a random string');
          break;
        case 'array=>string':
          value = ['a random string'];
          break;
        case 'ref=>Product':
          value = `${generateRandomString()}`;
          break;
        case 'array=>ref=>Product':
          value = [`${generateRandomString()}`];
          break;
        case 'date':
          value = new Date().toISOString();
          break;
        case 'number':
          value = Math.floor(Math.random() * 100);
          break;

        default:
          if (field.type.includes('array')) {
            const baseType = field.type.split('=>')[1];
            console.log(baseType);
            if (baseType.includes('ref')) {
              value = [`${generateRandomString()}`];
              break;
            } else if (baseType.toString() === 'string') {
              value = ['a random string'];
              break;
            } else if (baseType.toString() === 'date') {
              value = [new Date().toISOString()];
              break;
            } else if (baseType.toString() === 'number') {
              value = [Math.floor(Math.random() * 100)];
              break;
            } else if (baseType.toString() === 'boolean') {
              value = [true];
              break;
            }
          }
          value = null;
      }

      acc[field.name] = value;
      return acc;
    }, {});

    const requestsArray = [
      {
        name: `Create ${name.replace(name[0], name[0].toUpperCase())}`,
        method: 'POST',
        url: `{{url}}/api/v1/${name.toLowerCase()}/create`,
        token: '',
        body: {
          ...postmanFields,
        },
      },
      {
        name: `Get One ${name.replace(name[0], name[0].toUpperCase())}`,
        method: 'GET',
        url: `{{url}}/api/v1/${name.toLowerCase()}/${generateRandomString()}`,
        token: '',
      },
      {
        name: `Get All ${name.replace(name[0], name[0].toUpperCase())}`,
        method: 'GET',
        url: `{{url}}/api/v1/${name.toLowerCase()}`,
      },
      {
        name: `Update ${name.replace(name[0], name[0].toUpperCase())}`,
        method: 'PATCH',
        url: `{{url}}/api/v1/${name.toLowerCase()}`,
        token: '',
        body: {
          ...postmanFields,
        },
      },
      {
        name: `Delete ${name.replace(name[0], name[0].toUpperCase())}`,
        method: 'DELETE',
        url: `{{url}}/api/v1/${name.toLowerCase()}/${generateRandomString()}`,
        token: '',
      },
    ];
    // console.log(JSON.stringify(requestsArray));

    const moduleDir = `src/app/modules/${name}`;
    fs.mkdirSync(moduleDir, { recursive: true });

    const files = Object.keys(fileGenerators).map(type => ({
      path: `${moduleDir}/${name}.${type}`,
      type: type.split('.')[0],
    }));

    files.forEach(({ path, type }) => {
      const capitalizedModuleName =
        name.charAt(0).toUpperCase() + name.slice(1);
      const exportName = `${capitalizedModuleName}${
        type.charAt(0).toUpperCase() + type.slice(1)
      }`;
      const content = generateFileContent(
        type,
        name,
        capitalizedModuleName,
        exportName,
        parsedFields
      );
      fs.writeFileSync(path, content.trim() + '\n');
      console.log(`Created: ${path}`);
    });

    console.log(
      `\nSuccessfully created module '${name}' with all required files.`
    );
    console.log(`\nAdding requests to postman.`);

    const { config } = require(`${process.cwd()}/sparkpress.config.js`);
    await automatePostman(
      config.postman_api_key,
      config.postman_folder_name || name.toLowerCase(),
      config.postman_workspace_id,
      config.postman_collection_name,
      requestsArray
    );
    console.log(
      `\nSuccessfully added requests to postman and created required files`
    );
  } catch (error) {
    console.error('Error creating module:', error.message);
    process.exit(1);
  }
};
if (
  process.argv.toString().includes('--help') ||
  process.argv.toString().includes('-h')
) {
  program.outputHelp();
}
program
  .command('create <name> <fields...>')
  .description('Create a new module with specified fields')
  .action(createModule);

program.parse(process.argv);
