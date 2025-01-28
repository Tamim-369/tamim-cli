import { IField } from "../../../types/field.type";
import { IOptions } from "../../../types/options.type";

export const generateRouteTemplate = (
  name: string,
  capitalizedModuleName: string,
  fields: IField[],
  isExistFileField: boolean,
  options: IOptions
) => {
  return `
import express from 'express';
import { ${capitalizedModuleName}Controller } from './${name}.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest${
    isExistFileField ? "ZFD" : ""
  } from '../../middlewares/validateRequest';
import { ${capitalizedModuleName}Validation } from './${name}.validation';
${
  isExistFileField
    ? "import fileUploadHandler from '../../middlewares/fileUploadHandler';"
    : ""
}
const router = express.Router();
const rolesOfAccess = [USER_ROLES.ADMIN] // all the user role who you want to give access to create, update and delete route
router.post(
  '/create',
  auth(...rolesOfAccess),
  ${
    isExistFileField
      ? `fileUploadHandler(),
      validateRequestZFD(${capitalizedModuleName}Validation.create${capitalizedModuleName}ZodSchema),
      `
      : `validateRequest(${capitalizedModuleName}Validation.create${capitalizedModuleName}ZodSchema),`
  }
  ${capitalizedModuleName}Controller.create${capitalizedModuleName}
);
router.get('/', ${capitalizedModuleName}Controller.getAll${capitalizedModuleName}s);
router.get('/:id', ${capitalizedModuleName}Controller.get${capitalizedModuleName}ById);
router.patch(
  '/:id',
  auth(...rolesOfAccess),
  ${
    isExistFileField
      ? `fileUploadHandler(),
    validateRequestZFD(${capitalizedModuleName}Validation.update${capitalizedModuleName}ZodSchema),
    `
      : `validateRequest(${capitalizedModuleName}Validation.update${capitalizedModuleName}ZodSchema),`
  }
  ${capitalizedModuleName}Controller.update${capitalizedModuleName}
);
router.delete('/:id', auth(...rolesOfAccess), ${capitalizedModuleName}Controller.delete${capitalizedModuleName});

export const ${capitalizedModuleName}Routes = router;
`;
};
