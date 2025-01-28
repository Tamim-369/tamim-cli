import { IField } from "../../../types/field.type";

// Helper function to generate Zod schema for a single field in create validation
const generateCreateFieldSchema = (field: IField): string => {
  const { name, type, isRequired } = field;

  // Handle array of references (e.g., array=>ref=>User)
  if (type.includes("array=>ref=>")) {
    return `${name}: z.array(z.string({
      ${isRequired ? `required_error: "${name} is required",` : ""}
      invalid_type_error: "${name} array item should have type string"
    }))${!isRequired ? ".optional()" : ""}`;
  }

  // Handle array of primitive types (e.g., array=>string)
  if (type.includes("array")) {
    const arrayType = type.split("=>")[1];
    return `${name}: z.array(z.${arrayType}({
      ${isRequired ? `required_error: "${name} is required",` : ""}
      invalid_type_error: "${name} array item should have type ${arrayType}"
    }))${!isRequired ? ".optional()" : ""}`;
  }

  // Handle single field (primitive or reference)
  const fieldType = type.includes("ref") ? "string" : type;
  return `${name}: z.${fieldType}({
    ${
      isRequired
        ? `required_error: "${name === "Date" ? "date" : name} is required",`
        : ""
    }
    invalid_type_error: "${name} should be type ${
    type.includes("ref") ? "objectID or string" : type
  }"
  })${!isRequired ? ".optional()" : ""}`;
};

// Helper function to generate Zod schema for a single field in update validation
const generateUpdateFieldSchema = (field: IField): string => {
  const { name, type } = field;

  // Handle array of references (e.g., array=>ref=>User)
  if (type.includes("array=>ref=>")) {
    return `${name}: z.array(z.string({
      invalid_type_error: "${name} array item should have type string"
    })).optional()`;
  }

  // Handle array of primitive types (e.g., array=>string)
  if (type.includes("array")) {
    const arrayType = type.includes("array=>ref=>")
      ? "string"
      : type.split("=>")[1];
    return `${name}: z.array(z.${arrayType}({
      invalid_type_error: "${name} array item should have type ${arrayType}"
    })).optional()`;
  }

  // Handle single field (primitive or reference)
  const fieldType = type.includes("ref") ? "string" : type;
  return `${name}: z.${fieldType}({
    invalid_type_error: "${name} should be type ${
    type.includes("ref=>") ? "objectID or string" : type
  }"
  }).optional()`;
};

// Generate validation fields for create schema
const generateCreateValidationFields = (fields: IField[]): string => {
  return fields.map(generateCreateFieldSchema).join(",\n      ");
};

// Generate validation fields for update schema
const generateUpdateValidationFields = (fields: IField[]): string => {
  return fields.map(generateUpdateFieldSchema).join(",\n      ");
};

// Main function to generate the validation template
export const generateValidationTemplateNormal = (
  name: string,
  capitalizedModuleName: string,
  fields: IField[]
): string => {
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
