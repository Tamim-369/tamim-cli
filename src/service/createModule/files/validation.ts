import { FileFieldData, IField } from "../../../types/field.type";
import { generateValidationTemplateZFD } from "./validationZFD";
import { generateValidationTemplateNormal } from "./validationZOD";

export const generateValidationTemplate = (
  name: string,
  capitalizedModuleName: string,
  fields: IField[],
  isExistFileField: boolean,
  fileFieldData: FileFieldData[]
) => {
  if (isExistFileField) {
    return generateValidationTemplateZFD(
      name,
      capitalizedModuleName,
      fields,
      fileFieldData
    );
  }
  return generateValidationTemplateNormal(name, capitalizedModuleName, fields);
};
