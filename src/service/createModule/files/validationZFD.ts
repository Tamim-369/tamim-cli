import { FileFieldData, IField } from "../../../types/field.type";

// Helper function to generate Zod schema for a single field in create validation
const generateCreateFieldSchema = (
  field: IField,
  fileFieldData: FileFieldData[]
): string => {
  const { name, type, isRequired } = field;

  // Handle array of references (e.g., array=>ref=>User)
  if (type.includes("array=>ref=>")) {
    return `${name}: zfd.repeatable(z.array(zfd.text()))${
      !isRequired ? ".optional()" : ""
    }`;
  }

  if (fileFieldData.some((fileField) => fileField.fieldName === name)) {
    return `${name}: zfd.file()${".optional()"}`;
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
    return `${name}: zfd.repeatable(z.array(${zodType}()))${
      !isRequired ? ".optional()" : ""
    }`;
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
  return `${name}: ${zodType}()${!isRequired ? ".optional()" : ""}`;
};

// Helper function to generate Zod schema for a single field in update validation
const generateUpdateFieldSchema = (
  field: IField,
  fileFieldData: FileFieldData[]
): string => {
  const { name, type } = field;

  // Handle array of references (e.g., array=>ref=>User)
  if (type.includes("array=>ref=>")) {
    return `${name}: zfd.repeatable(z.array(zfd.text())).optional()`;
  }
  if (fileFieldData.some((fileField) => fileField.fieldName === name)) {
    return `${name}: zfd.file().optional()`;
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
    return `${name}: zfd.repeatable(z.array(${zodType}())).optional()`;
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
  return `${name}: ${zodType}().optional()`;
};

// Generate validation fields for create schema
const generateCreateValidationFields = (
  fields: IField[],
  fileFieldData: FileFieldData[]
): string => {
  return fields
    .map((field) => generateCreateFieldSchema(field, fileFieldData))
    .join(",\n      ");
};

// Generate validation fields for update schema
const generateUpdateValidationFields = (
  fields: IField[],
  fileFieldData: FileFieldData[]
): string => {
  return fields
    .map((field) => generateUpdateFieldSchema(field, fileFieldData))
    .join(",\n      ");
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
