import { generateControllerTemplate } from "../module/controller";
import { generateInterfaceTemplate } from "../module/interface";
import { generateModelTemplate } from "../module/model";
import { generateRouteTemplate } from "../module/route";
import { generateServiceTemplate } from "../module/service";
import { generateValidationTemplate } from "../module/validation";

// File generator configuration
export const fileGenerators: any = {
  "route.ts": generateRouteTemplate,
  "controller.ts": generateControllerTemplate,
  "service.ts": generateServiceTemplate,
  "validation.ts": generateValidationTemplate,
  "interface.ts": generateInterfaceTemplate,
  "model.ts": generateModelTemplate,
};
