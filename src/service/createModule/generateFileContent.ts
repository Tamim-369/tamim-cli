import { fileGenerators } from "./fileGeneratos";
import { FileTypes } from "../../enums/fileTypes";
import { FileFieldData, IField } from "../../types/field.type";

export const generateFileContent = (
  fileType: string,
  name: string,
  capitalizedModuleName: string,
  exportName: string,
  fields: IField[]
) => {
  const generator = fileGenerators[`${fileType}.ts`];
  if (!generator) {
    return `// Define your ${fileType} logic here\nexport const ${exportName} = {};`;
  }
  const fileFieldData: FileFieldData[] | null = [];
  const processedFields = new Set<string>();

  fields.forEach((field) => {
    if (!processedFields.has(field.name)) {
      for (const fileType of Object.values(FileTypes)) {
        if (
          field.name.toLowerCase().includes(fileType.toLowerCase()) &&
          field.type === "string"
        ) {
          fileFieldData.push({
            fieldName: field.name,
            fieldType: fileType,
          });
          processedFields.add(field.name);
          break;
        }
      }
    }
  });
  const isExistFileField = fileFieldData.length > 0;
  return generator(
    name,
    capitalizedModuleName,
    fields,
    isExistFileField,
    fileFieldData || null
  );
};
