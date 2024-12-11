export default function addConstantFile(moduleName: string) {
  return `
  export const ${moduleName} = "random"; // any constant variable
  `;
}
