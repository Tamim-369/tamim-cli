export default function addUtilsFile(moduleName: string) {
  return `
    export const ${moduleName}RandomUtilFunction = (random:string) => {
        console.log(random)
    };
    `;
}
