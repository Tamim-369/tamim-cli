import fs from "fs";
import path from "path";
import addControllerFile from "../service/addFile/files/controller";
import addRouteFile from "../service/addFile/files/route";
import addValidationFile from "../service/addFile/files/validation";
import addServiceFile from "../service/addFile/files/service";
import addInterfaceFile from "../service/addFile/files/interface";
import addModelFile from "../service/addFile/files/model";
import addUtilsFile from "../service/addFile/files/utils";
import addConstantFile from "../service/addFile/files/constants";

export default function addFile(moduleFiles: string): void {
  for (const file of moduleFiles) {
    const [modulePath, fileType] = file.split(":");
    const moduleArray = modulePath.includes("/")
      ? modulePath.split("/")
      : [modulePath];
    const moduleName = moduleArray[moduleArray.length - 1];
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
      case "constant":
        content = addConstantFile(moduleName);
        break;
      case "utils":
        content = addUtilsFile(moduleName);
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
        ...moduleArray
      );
      fs.mkdirSync(moduleDir, { recursive: true });

      const filePath = path.join(moduleDir, `${moduleName}.${fileType}.ts`);
      fs.writeFileSync(filePath, content, "utf8");
    }
  }
}
