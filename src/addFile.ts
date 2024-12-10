import addControllerFile from "./files/controller";
import fs from "fs";
import path from "path";
import addRouteFile from "./files/route";
import addValidationFile from "./files/validation";
import addServiceFile from "./files/service";
import addInterfaceFile from "./files/interface";
import addModelFile from "./files/model";

export default function addFile(moduleFiles: string): void {
  for (const file of moduleFiles) {
    const [moduleName, fileType] = file.split(":");

    let content = "";
    switch (fileType) {
      case "controller":
        content = addControllerFile(moduleName);
        break;
      case "route":
        content = addRouteFile(moduleName);
        break;
      case "validation":
        content = addValidationFile(moduleName);
        break;
      case "service":
        content = addServiceFile(moduleName);
        break;
      case "interface":
        content = addInterfaceFile(moduleName);
        break;
      case "model":
        content = addModelFile(moduleName);
        break;
      default:
        const capitalizedModuleName =
          moduleName[0].toUpperCase() + moduleName.slice(1);
        content = `// Define your ${fileType} logic here\nexport const ${capitalizedModuleName}${fileType} = {};`;
    }

    if (content) {
      const moduleDir = path.join(
        process.cwd(),
        "src",
        "app",
        "modules",
        moduleName
      );
      fs.mkdirSync(moduleDir, { recursive: true });

      const filePath = path.join(moduleDir, `${moduleName}.${fileType}.ts`);
      fs.writeFileSync(filePath, content, "utf8");
    }
  }
}
