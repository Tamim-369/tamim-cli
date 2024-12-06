import { program } from "commander";
import fs from "fs";
import axios from "axios";
import path from "path";
import { automatePostman } from "./postman/createModulePostman.js";
import { IField } from "./types/field.type.js";
import { generateRouteTemplate } from "./module/route.js";
import { generateServiceTemplate } from "./module/service.js";
import { generateControllerTemplate } from "./module/controller.js";
import { generateValidationTemplate } from "./module/validation.js";
import { generateInterfaceTemplate } from "./module/interface.js";
import { generateModelTemplate } from "./module/model.js";
import { FileTypes } from "./enums/fileTypes.js";

// File generator configuration
const fileGenerators: any = {
  "route.ts": generateRouteTemplate,
  "controller.ts": generateControllerTemplate,
  "service.ts": generateServiceTemplate,
  "validation.ts": generateValidationTemplate,
  "interface.ts": generateInterfaceTemplate,
  "model.ts": generateModelTemplate,
};

const generateFileContent = (
  fileType: string,
  name: string,
  capitalizedModuleName: string,
  exportName: string,
  fields: IField[]
) => {
  const generator = fileGenerators[`${fileType}.ts`];
  if (!generator) {
    return `// Define your ${fileType} logic here\nexport const ${exportName} = {};`;
  }
  let fileFieldData = {
    fieldName: "",
    fieldType: "",
  };
  const isExistFileField = fields.some((field) =>
    Object.values(FileTypes).some((fileType) => {
      if (field.name.includes(fileType)) {
        fileFieldData.fieldName = field.name;
        fileFieldData.fieldType = fileType;
        return true;
      }
      return false;
    })
  );
  return generator(
    name,
    capitalizedModuleName,
    fields,
    isExistFileField,
    fileFieldData || null
  );
};
process.stdin.isTTY = false;
process.stdout.isTTY = false;
const createModule = async (name: string, fields: any) => {
  const isExistConfig = fs.existsSync(
    path.resolve(process.cwd(), "sparkpress.config.cjs")
  );

  try {
    const parsedFields = fields.map((field: any) => {
      const [fieldName, fieldType] = field?.includes("?:")
        ? field.replace("?:", ":").split(":")
        : field.split(":");

      if (!fieldName || !fieldType) {
        throw new Error(
          `Invalid field format: ${field}. Expected format: name:type`
        );
      }
      return {
        name: fieldName,
        type: fieldType,
        isRequired: field.toString().includes("?") ? false : true,
      };
    });
    const generateRandomString = () =>
      Math.random().toString(36).substring(2, 15); // Generates a random string

    const postmanFields = parsedFields.reduce((acc: any, field: any) => {
      let value;

      switch (field.type) {
        case "string":
          field.name.includes("email")
            ? (value = "name@company.com")
            : (value = "a random string");
          break;
        case "array=>string":
          value = ["a random string"];
          break;
        case "ref=>Product":
          value = `${generateRandomString()}`;
          break;
        case "array=>ref=>Product":
          value = [`${generateRandomString()}`];
          break;
        case "date":
          value = new Date().toISOString();
          break;
        case "number":
          value = Math.floor(Math.random() * 100);
          break;

        default:
          if (field.type.includes("array")) {
            const baseType = field.type.split("=>")[1];
            console.log(baseType);
            if (baseType.includes("ref")) {
              value = [`${generateRandomString()}`];
              break;
            } else if (baseType.toString() === "string") {
              value = ["a random string"];
              break;
            } else if (baseType.toString() === "date") {
              value = [new Date().toISOString()];
              break;
            } else if (baseType.toString() === "number") {
              value = [Math.floor(Math.random() * 100)];
              break;
            } else if (baseType.toString() === "boolean") {
              value = [true];
              break;
            }
          }
          value = null;
      }

      acc[field.name] = value;
      return acc;
    }, {});

    const requestsArray = [
      {
        name: `Create ${name.replace(name[0], name[0].toUpperCase())}`,
        method: "POST",
        url: `{{url}}/api/v1/${name.toLowerCase()}/create`,
        token: "",
        body: {
          ...postmanFields,
        },
      },
      {
        name: `Get One ${name.replace(name[0], name[0].toUpperCase())}`,
        method: "GET",
        url: `{{url}}/api/v1/${name.toLowerCase()}/${generateRandomString()}`,
        token: "",
      },
      {
        name: `Get All ${name.replace(name[0], name[0].toUpperCase())}`,
        method: "GET",
        url: `{{url}}/api/v1/${name.toLowerCase()}`,
      },
      {
        name: `Update ${name.replace(name[0], name[0].toUpperCase())}`,
        method: "PATCH",
        url: `{{url}}/api/v1/${name.toLowerCase()}`,
        token: "",
        body: {
          ...postmanFields,
        },
      },
      {
        name: `Delete ${name.replace(name[0], name[0].toUpperCase())}`,
        method: "DELETE",
        url: `{{url}}/api/v1/${name.toLowerCase()}/${generateRandomString()}`,
        token: "",
      },
    ];
    // console.log(JSON.stringify(requestsArray));

    const moduleDir = path.join(process.cwd(), "src", "app", "modules", name);
    fs.mkdirSync(moduleDir, { recursive: true });
    const files = Object.keys(fileGenerators).map((type) => ({
      path: `${moduleDir}/${name}.${type}`,
      type: type.split(".")[0],
    }));

    files.forEach(({ path, type }) => {
      const capitalizedModuleName =
        name.charAt(0).toUpperCase() + name.slice(1);
      const exportName = `${capitalizedModuleName}${
        type.charAt(0).toUpperCase() + type.slice(1)
      }`;
      const content = generateFileContent(
        type,
        name,
        capitalizedModuleName,
        exportName,
        parsedFields
      );
      fs.writeFileSync(path, content.trim() + "\n");
      console.log(`Created: ${path}`);
    });

    console.log(
      `\nSuccessfully created module '${name}' with all required files.`
    );
    console.log(`\nAdding requests to postman.`);

    if (isExistConfig) {
      const configPath = path.resolve(process.cwd(), "sparkpress.config.cjs");
      const { config } = require(configPath);
      await automatePostman(
        config.postman_api_key,
        config.postman_folder_name || name.toLowerCase(),
        config.postman_workspace_id,
        config.postman_collection_name,
        requestsArray
      );
    }
    console.log(
      `\nSuccessfully added requests to postman and created required files`
    );
  } catch (error: any) {
    console.error("Error parsing fields:", error.message);
    console.error("Error creating module:", error.message);
    process.exit(1);
  }
};
if (
  process.argv.toString().includes("--help") ||
  process.argv.toString().includes("-h")
) {
  program.outputHelp();
}
program
  .command("create <name> <fields...>")
  .description("Create a new module with specified fields")
  .action(createModule);

program.parse(process.argv);
