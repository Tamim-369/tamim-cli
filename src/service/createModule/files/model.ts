import { IField } from "../../../types/field.type";

export const generateModelTemplate = (
  name: string,
  capitalizedModuleName: string,
  fields: any
) => {
  const generateSchemaFields = (fields: IField[]) => {
    return fields
      .map((field: IField) => {
        if (field.type.includes("array") && !field.type.includes("ref")) {
          return `${field.name}: {type: [${field.type
            .split("=>")[1]
            .replace(
              field.type.split("=>")[1][0],
              field.type.split("=>")[1][0].toUpperCase()
            )}], required: ${field.isRequired} }`;
        }

        if (field.type.includes("ref")) {
          if (field.type.includes("array=>ref")) {
            return `${field.name}: {
                type: [{ type: Schema.Types.ObjectId, ref: '${
                  field.type.split("ref=>")[1]
                }'},],
                required: ${field.isRequired}
              }`;
          }
          return `${field.name}: { type: Schema.Types.ObjectId, ref: '${
            field.type.split("=>")[1]
          }', required: ${field.isRequired} }`;
        }

        return `${field.name}: { type: ${field.type.replace(
          field.type[0],
          field.type[0].toUpperCase()
        )}, required: ${field.isRequired} }`;
      })
      .join(",\n  ");
  };

  return `
  import { Schema, model } from 'mongoose';
  import { I${capitalizedModuleName}, ${capitalizedModuleName}Model } from './${name}.interface';
  
  const ${name}Schema = new Schema<I${capitalizedModuleName}, ${capitalizedModuleName}Model>({
    ${generateSchemaFields(fields)}
  }, { timestamps: true });
  
  export const ${capitalizedModuleName} = model<I${capitalizedModuleName}, ${capitalizedModuleName}Model>('${capitalizedModuleName}', ${name}Schema);
  `;
};
