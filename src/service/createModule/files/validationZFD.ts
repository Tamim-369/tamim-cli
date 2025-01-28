import { FileFieldData, IField } from "../../../types/field.type";

// Helper function to generate Zod schema for a single field in create validation
const generateCreateFieldSchema = (
  field: IField,
  fileFieldData: FileFieldData[]
): string => {
  const { name, type, isRequired } = field;

  // Handle array of references (e.g., array=>ref=>User)
  if (type.includes("array=>ref=>")) {
    return `${name}: zfd.repeatable(z.array(zfd.text({
      ${isRequired ? `required_error: "${name} is required",` : ""}
      invalid_type_error: "${name} array item should be type string"
    })))${!isRequired ? ".optional()" : ""}`;
  }

  if (
    fileFieldData.includes({
      fieldName: name,
      fieldType: type,
    } as FileFieldData)
  ) {
    return `${name}: zfd.file({
      ${isRequired ? `required_error: "${name} is required",` : ""}
      invalid_type_error: "${name} should be type file"
    })${!isRequired ? ".optional()" : ""}`;
  }

  // Handle array of primitive types (e.g., array=>string)
  if (type.includes("array")) {
    const arrayType = type.split("=>")[1];
    let zodType;
    switch (arrayType) {
      case "number":
        zodType = "zfd.numeric";
        break;
      case "boolean":
        zodType = "zfd.checkbox";
        break;
      default:
        zodType = "zfd.text";
    }
    return `${name}: zfd.repeatable(z.array(${zodType}({
      ${isRequired ? `required_error: "${name} is required",` : ""}
      invalid_type_error: "${name} array item should be type ${arrayType}"
    })))${!isRequired ? ".optional()" : ""}`;
  }

  // Handle single field (primitive or reference)
  let zodType;
  switch (type) {
    case "number":
      zodType = "zfd.numeric";
      break;
    case "boolean":
      zodType = "zfd.checkbox";
      break;
    default:
      zodType = "zfd.text";
  }
  return `${name}: ${zodType}({
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
    return `${name}: zfd.repeatable(z.array(zfd.text({
      invalid_type_error: "${name} array item should be type string"
    }))).optional()`;
  }

  // Handle array of primitive types (e.g., array=>string)
  if (type.includes("array")) {
    const arrayType = type.includes("array=>ref=>")
      ? "string"
      : type.split("=>")[1];
    let zodType;
    switch (arrayType) {
      case "number":
        zodType = "zfd.numeric";
        break;
      case "boolean":
        zodType = "zfd.checkbox";
        break;
      default:
        zodType = "zfd.text";
    }
    return `${name}: zfd.repeatable(z.array(${zodType}({
      invalid_type_error: "${name} array item should be type ${arrayType}"
    }))).optional()`;
  }

  // Handle single field (primitive or reference)
  let zodType;
  switch (type) {
    case "number":
      zodType = "zfd.numeric";
      break;
    case "boolean":
      zodType = "zfd.checkbox";
      break;
    default:
      zodType = "zfd.text";
  }
  return `${name}: ${zodType}({
    invalid_type_error: "${name} should be type ${
    type.includes("ref=>") ? "objectID or string" : type
  }"
  }).optional()`;
};

// Generate validation fields for create schema
const generateCreateValidationFields = (
  fields: IField[],
  fileFieldData: FileFieldData[]
): string => {
  return fields.map(generateCreateFieldSchema).join(",\n      ");
};

// Generate validation fields for update schema
const generateUpdateValidationFields = (
  fields: IField[],
  fileFieldData: FileFieldData[]
): string => {
  return fields.map(generateUpdateFieldSchema).join(",\n      ");
};

// Main function to generate the validation template
export const generateValidationTemplateZFD = (
  name: string,
  capitalizedModuleName: string,
  fields: IField[],
  fileFieldData: FileFieldData[]
): string => {
  return `import { zfd } from 'zod-form-data';
import { z } from 'zod';
        
const create${capitalizedModuleName}ZodSchema = zfd.formData({
  ${generateCreateValidationFields(fields, fileFieldData)}
});

const update${capitalizedModuleName}ZodSchema = zfd.formData({
  ${generateUpdateValidationFields(fields, fileFieldData)}
});

export const ${capitalizedModuleName}Validation = {
  create${capitalizedModuleName}ZodSchema,
  update${capitalizedModuleName}ZodSchema
};`;
};
