import { FileTypes } from "../enums/fileTypes";
import { IField } from "../types/field.type";

export const generateRouteTemplate = (
  name: string,
  capitalizedModuleName: string,
  fields: IField[],
  isExistFileField: boolean
) => {
  return `
import express from 'express';
import { ${capitalizedModuleName}Controller } from './${name}.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ${capitalizedModuleName}Validation } from './${name}.validation';
${
  isExistFileField &&
  "import fileUploadHandler from '../../middlewares/fileUploadHandler';"
}
const router = express.Router();

router.post(
  '/create',
  // change the role according to your preferences
  // auth(USER_ROLES.ADMIN),
  ${
    isExistFileField
      ? "fileUploadHandler(),"
      : `validateRequest(${capitalizedModuleName}Validation.create${capitalizedModuleName}ZodSchema),`
  }
  ${capitalizedModuleName}Controller.create${capitalizedModuleName}
);
router.get('/', ${capitalizedModuleName}Controller.getAll${capitalizedModuleName}s);
router.get('/:id', ${capitalizedModuleName}Controller.get${capitalizedModuleName}ById);
router.patch(
  '/:id',
  // change the role according to your preferences
  // auth(USER_ROLES.ADMIN),
  ${
    isExistFileField
      ? "fileUploadHandler(),"
      : `validateRequest(${capitalizedModuleName}Validation.update${capitalizedModuleName}ZodSchema),`
  }
  ${capitalizedModuleName}Controller.update${capitalizedModuleName}
);
router.delete('/:id', auth(USER_ROLES.ADMIN), ${capitalizedModuleName}Controller.delete${capitalizedModuleName});

export const ${capitalizedModuleName}Routes = router;
`;
};
