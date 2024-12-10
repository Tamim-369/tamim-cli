export default function addModelFile(moduleName: string): string {
  const capitalizedModuleName =
    moduleName[0].toUpperCase() + moduleName.slice(1);
  return `
  import { Schema, model } from 'mongoose';
  import { I${capitalizedModuleName}, ${capitalizedModuleName}Model } from './${moduleName}.interface';
  
  const ${moduleName}Schema = new Schema<I${capitalizedModuleName}, ${capitalizedModuleName}Model>({
   // ...your schema fields
  }, { timestamps: true });
  
  export const ${capitalizedModuleName} = model<I${capitalizedModuleName}, ${capitalizedModuleName}Model>('${capitalizedModuleName}', ${moduleName}Schema);
  `;
}
