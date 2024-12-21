import { generateRandomString } from "../utils/random";
import { request } from "../types/request.type";

export const createRequestArray = async (
  name: string,
  fields: any,
  postmanFields: any
) => {
  const requestsArray: request[] = [
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
  return requestsArray;
};
