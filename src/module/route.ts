export const generateRouteTemplate = (
  name: string,
  capitalizedModuleName: string
) => `
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
