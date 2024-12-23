import { generateControllerTemplate } from "./files/controller";
import { generateInterfaceTemplate } from "./files/interface";
import { generateModelTemplate } from "./files/model";
import { generateRouteTemplate } from "./files/route";
import { generateServiceTemplate } from "./files/service";
import { generateValidationTemplate } from "./files/validation";

// File generator configuration
export const fileGenerators: any = {
  "route.ts": generateRouteTemplate,
  "controller.ts": generateControllerTemplate,
  "service.ts": generateServiceTemplate,
  "validation.ts": generateValidationTemplate,
  "interface.ts": generateInterfaceTemplate,
  "model.ts": generateModelTemplate,
};
