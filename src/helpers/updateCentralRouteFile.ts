import fs from "fs";
import path from "path";

export function updateRouterFile(
  folderName: string,
  camelCaseName: string
): void {
  const routerPath = path.join(__dirname, "routes", "index.ts");
  const routeImport = `import { ${camelCaseName}Routes } from '../app/modules/${folderName}/${folderName}.route';`;
  const routeEntry = `{ path: '/${folderName}', route: ${camelCaseName}Routes }`;

  let routerFileContent = fs.readFileSync(routerPath, "utf-8");

  // Check if the import statement is already present
  if (!routerFileContent.includes(routeImport)) {
    routerFileContent = `${routeImport}\n${routerFileContent}`;
  }

  // Find the `apiRoutes` array and update it
  const apiRoutesRegex =
    /export const apiRoutes: \{ path: string; route: any \}\[] = \[(.*?)\]/s;
  const match = routerFileContent.match(apiRoutesRegex);

  if (match) {
    const currentRoutes = match[1].trim();
    if (!currentRoutes.includes(routeEntry)) {
      const updatedRoutes = currentRoutes
        ? `${currentRoutes},\n  ${routeEntry}`
        : `${routeEntry}`;
      routerFileContent = routerFileContent.replace(
        apiRoutesRegex,
        `export const apiRoutes: { path: string; route: any }[] = [\n  ${updatedRoutes}\n]`
      );
    }
  } else {
    console.error(
      "Failed to find apiRoutes array. Ensure the index.ts file has a properly defined apiRoutes array."
    );
    return;
  }

  // Write the updated content back to the `index.ts` file
  fs.writeFileSync(routerPath, routerFileContent, "utf-8");
  console.log(`✅ Added route for ${camelCaseName} to central router.`);
}
