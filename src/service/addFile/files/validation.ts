import { capitalizedName } from "../../../helpers/capitalize";

export default function addValidationFile(moduleName: string) {
  const capitalizedModuleName = capitalizedName(moduleName);
  return `
   import { z } from 'zod';
        
  const create${capitalizedModuleName}ZodSchema = z.object({
    body: z.object({
     // ...your validation rules
    }),
  });
  

  
  export const ${capitalizedModuleName}Validation = {
    create${capitalizedModuleName}ZodSchema,
  }; `;
}
