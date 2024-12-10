export default function addValidationFile(moduleName: string) {
  const capitalizedModuleName =
    moduleName[0].toUpperCase() + moduleName.slice(1);
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
