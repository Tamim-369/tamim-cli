import fs from "fs";
import axios from "axios";
import path from "path";
import { request } from "../types/request.type";
import { fileGenerators } from "../service/createModule/fileGeneratos";
import { capitalize, capitalizedName } from "../helpers/capitalize";
import { FileFieldData, IField } from "../types/field.type";
import { FileTypes } from "../enums/fileTypes";
import { parseFields } from "../utils/parseFields";
import { generateRandomString } from "../utils/random";
import { generateFileContent } from "../service/createModule/generateFileContent";
import { createPostmanFields } from "../service/createModule/postman/postmanFields";
import { createRequestArray } from "../service/createModule/postman/requestArray";
import { automatePostman } from "../service/createModule/postman/createModulePostman";
import { updateRouterFile } from "../helpers/updateCentralRouteFile";

export const createModule = async (name: string, fields: string[]) => {
  if (!name) {
    console.error("Error: Module name is required");
    process.exit(1);
  }

  if (!Array.isArray(fields) || fields.length === 0) {
    console.error("Error: At least one field must be specified");
    process.exit(1);
  }

  const isExistConfig = fs.existsSync(
    path.resolve(process.cwd(), "tamim.config.cjs")
  );

  try {
    const parsedFields = await parseFields(fields);
    const postmanFields = await createPostmanFields(parsedFields);
    const requestsArray = await createRequestArray(name, fields, postmanFields);

    const moduleDir = path.join(process.cwd(), "src", "app", "modules", name);
    fs.mkdirSync(moduleDir, { recursive: true });
    const files = Object.keys(fileGenerators).map((type) => ({
      path: `${moduleDir}/${name}.${type}`,
      type: type.split(".")[0],
    }));

    files.forEach(({ path, type }) => {
      const capitalizedModuleName = capitalize(name);
      const exportName = `${capitalizedModuleName}${capitalize(type)}`;
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
    const fileFieldData: FileFieldData[] | null = [];
    const processedFields = new Set<string>();

    parsedFields.forEach((field: IField) => {
      if (!processedFields.has(field.name)) {
        for (const fileType of Object.values(FileTypes)) {
          if (
            field.name.toLowerCase().includes(fileType.toLowerCase()) &&
            field.type === "string"
          ) {
            fileFieldData.push({
              fieldName: field.name,
              fieldType: fileType,
            });
            processedFields.add(field.name);
            break;
          }
        }
      }
    });
    const isExistFileField = fileFieldData.length > 0;
    console.log(
      `\nSuccessfully created module '${name}' with all required files.`
    );
    console.log(`\nAdding requests to postman.`);

    if (isExistConfig) {
      const configPath = path.resolve(process.cwd(), "tamim.config.cjs");
      const { config } = require(configPath);
      await automatePostman(
        config.postman_api_key,
        config.postman_folder_name || name.toLowerCase(),
        config.postman_workspace_id,
        config.postman_collection_name,
        requestsArray,
        isExistFileField as boolean,
        fileFieldData as { fieldName: string; fieldType: string }[] | null
      );
    }

    //update central route file
    updateRouterFile(name, capitalizedName(name));

    console.log(
      `\nSuccessfully added requests to postman and created required files`
    );
  } catch (error: any) {
    console.error("Error parsing fields:", error.message);
    console.error("Error creating module:", error.message);
    process.exit(1);
  }
};
