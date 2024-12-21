import { IField } from "../../../types/field.type";

export const generateValidationTemplate = (
  name: string,
  capitalizedModuleName: string,
  fields: IField[]
) => {
  const generateCreateValidationFields = (fields: IField[]) => {
    return fields
      .map((field) => {
        if (field.type.includes("array=>ref=>")) {
          return `${field.name}: z.array(z.string({${
            field.isRequired === true
              ? `required_error:"${field.name} is required",`
              : ""
          } invalid_type_error:"${
            field.name
          } array item should have type string" })${
            field.isRequired === false ? `.optional()` : ""
          })`;
        }
        if (field.type.includes("array")) {
          return `${field.name}: z.array(z.${field.type.split("=>")[1]}({ ${
            field.isRequired === true
              ? `required_error:"${field.name} is required",`
              : ""
          } invalid_type_error:"${field.name} array item should have type ${
            field.type.split("=>")[1]
          }" })${field.isRequired === false ? `.optional()` : ""})`;
        }
        return `${field.name}: z.${
          field.type.includes("ref") ? "string" : field.type
        }({ ${
          field.isRequired &&
          `required_error:"${
            field.name === "Date" ? "date" : field.name
          } is required",`
        } invalid_type_error:"${field.name} should be type ${
          field.type.includes("ref") ? "objectID or string" : field.type
        }" })`;
      })
      .join(",\n      ");
  };

  const generateUpdateValidationFields = (fields: IField[]) => {
    return fields
      .map((field) => {
        if (field.type.includes("array=>ref=>")) {
          return `${field.name}: z.array(z.string({ invalid_type_error:"${field.name} array item should have type string" })).optional()`;
        }
        if (field.type.includes("array")) {
          return `${field.name}: z.array(z.${
            field.type.split("=>")[1]
          }({ invalid_type_error:"${field.name} array item should have type ${
            field.type.includes("array=>ref=>")
              ? "string"
              : field.type.split("=>")[1]
          }" })).optional()`;
        }
        if (field.type.includes("ref") && !field.type.includes("array")) {
          console.log(true);
          return `${field.name}: z.string({ invalid_type_error:"${field.name} should be type string" }).optional()`;
        }
        return `${field.name}: z.${
          field.type.includes("ref") ? "string" : field.type
        }({ invalid_type_error:"${field.name} should be type ${
          field.type.includes("ref=>") ? "objectID or string" : field.type
        }" }).optional()`;
      })
      .join(",\n      ");
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
