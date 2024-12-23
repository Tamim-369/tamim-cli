import { capitalizedName } from "../../../helpers/capitalize";

export default function addModelFile(moduleName: string): string {
  const capitalizedModuleName = capitalizedName(moduleName);
  return `
  import { Schema, model } from 'mongoose';
  import { I${capitalizedModuleName}, ${capitalizedModuleName}Model } from './${moduleName}.interface';
  
  const ${moduleName}Schema = new Schema<I${capitalizedModuleName}, ${capitalizedModuleName}Model>({
   // ...your schema fields
  }, { timestamps: true });
  
  export const ${capitalizedModuleName} = model<I${capitalizedModuleName}, ${capitalizedModuleName}Model>('${capitalizedModuleName}', ${moduleName}Schema);
  `;
}
