import { IField } from "../../../types/field.type";

export const generateInterfaceTemplate = (
  name: string,
  capitalizedModuleName: string,
  fields: IField[]
) => {
  const generateFieldTypes = (fields: IField[]) => {
    return fields
      .map((field: IField) => {
        const fieldname = `${field.name}${field.isRequired ? "" : "?"}`;
        if (field.type.includes("ref")) {
          return `${fieldname}: ${
            field.type.includes("array=>ref=>")
              ? "[Types.ObjectId]"
              : "Types.ObjectId"
          }`;
        }
        if (field.type === "date") return `${fieldname}: Date`;
        if (field.type.includes("array")) {
          const baseType = field.type.split("=>")[1];
          return `${fieldname}: Array<${
            baseType.includes("ref")
              ? "Types.ObjectId"
              : baseType.includes("date")
              ? "Date"
              : baseType
          }>`;
        }
        return `${fieldname}: ${field.type}`;
      })
      .join(";\n  ");
  };

  return `
  import { Model, Types } from 'mongoose';
  
  export type I${capitalizedModuleName} = {
    ${generateFieldTypes(fields)}
  };
  
  export type ${capitalizedModuleName}Model = Model<I${capitalizedModuleName}>;
  `;
};
