import { capitalizedName } from "../helpers/capitalize";

export default function addRouteFile(moduleName: string) {
  const capitalizedModuleName = capitalizedName(moduleName);
  return `
  import express from 'express';
import { ${capitalizedModuleName}Validation } from './${moduleName}.validation';
import { ${capitalizedModuleName}Controller } from './${moduleName}.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
const router = express.Router();
const rolesOfAccess = [USER_ROLES.ADMIN] // all the user role who you want to give access to create, update and delete route
// a route example
router.post(
  '/create',
  auth(...rolesOfAccess),
  validateRequest(${capitalizedModuleName}Validation.create${capitalizedModuleName}ZodSchema),
  ${capitalizedModuleName}Controller.create${capitalizedModuleName}
);
  
  
  export const ${capitalizedModuleName}Routes = router;
  `;
}
