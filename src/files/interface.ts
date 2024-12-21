import { capitalizedName } from "../helpers/capitalize";

export default function addInterfaceFile(moduleName: string) {
  const capitalizedModuleName = capitalizedName(moduleName);
  return `
    import { Types, Model } from 'mongoose';
    export type I${capitalizedModuleName} = {
        // ...your interface properties
    }
    export type ${capitalizedModuleName}Model = Model<I${capitalizedModuleName}>;
    `;
}
