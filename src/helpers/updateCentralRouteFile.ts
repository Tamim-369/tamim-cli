import fs from "fs";
import path from "path";

export function updateRouterFile(
  folderName: string,
  camelCaseName: string
): void {
  try {
    const routerPath = path.join(process.cwd(), "src", "routes", "index.ts");
    const routeImport = `import { ${camelCaseName}Routes } from '../app/modules/${folderName}/${folderName}.route';`;
    const routeEntry = `  {
    path: '/${folderName}',
    route: ${camelCaseName}Routes,
  }`;

    let routerFileContent = fs.readFileSync(routerPath, "utf-8");

    // Add import if not exists
    if (!routerFileContent.includes(routeImport)) {
      // Find the last import statement
      const lastImportIndex = routerFileContent.lastIndexOf("import");
      const endOfLastImport =
        routerFileContent.indexOf(";", lastImportIndex) + 1;

      routerFileContent =
        routerFileContent.slice(0, endOfLastImport) +
        "\n" +
        routeImport +
        routerFileContent.slice(endOfLastImport);
    }

    // Find and update apiRoutes array
    const apiRoutesMatch = routerFileContent.match(
      /const apiRoutes\s*=\s*\[([\s\S]*?)\];/
    );

    if (apiRoutesMatch) {
      const currentRoutes = apiRoutesMatch[1].trim();

      // Check if route already exists
      if (!currentRoutes.includes(`path: '/${folderName}'`)) {
        const updatedRoutes = currentRoutes
          ? `${currentRoutes}\n${routeEntry}`
          : routeEntry;

        routerFileContent = routerFileContent.replace(
          /const apiRoutes\s*=\s*\[([\s\S]*?)\];/,
          `const apiRoutes = [\n${updatedRoutes}\n];`
        );

        fs.writeFileSync(routerPath, routerFileContent);
        console.log(`Successfully updated routes for ${folderName}`);
      }
    } else {
      throw new Error("Could not find apiRoutes array in router file");
    }
  } catch (error) {
    console.error("Error updating router file:", error);
    throw error;
  }
}
