export default function addInterfaceFile(moduleName: string) {
  const capitalizedModuleName =
    moduleName[0].toUpperCase() + moduleName.slice(1);
  return `
    import { Types, Model } from 'mongoose';
    export type I${capitalizedModuleName} = {
        // ...your interface properties
    }
    export type ${capitalizedModuleName}Model = Model<I${capitalizedModuleName}>;
    `;
}
