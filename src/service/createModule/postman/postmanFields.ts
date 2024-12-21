import { generateRandomString } from "../../../utils/random";

export const createPostmanFields = async (parsedFields: any[]) => {
  return await parsedFields.reduce((acc: any, field: any) => {
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
};
