import dotenv from "dotenv";
import axios from "axios";
import { request } from "../types/request.type";
import { FileTypes } from "../enums/fileTypes";

dotenv.config();

const isExistCollectionByID = async (apiKey: string, collectionId: string) => {
  const response = await axios.get(
    `https://api.getpostman.com/collections/${collectionId}`,
    {
      headers: { "X-Api-Key": apiKey },
    }
  );
  if (!response.data.collection) {
    console.log("Collection not found");
    throw new Error("Collection not found");
  }
  return response.data.collection;
};

export const automatePostman = async (
  apiKey: string,
  folderName: string,
  workspaceid: string,
  collectionName: string,
  requestsArray: request[],
  isFormData: boolean = false,
  fileFieldData: { fieldName: string; fieldType: string }[] | null = null
) => {
  if (!Array.isArray(requestsArray)) {
    console.log("requestsArray must be an array");
    throw new Error("requestsArray must be an array");
  }

  // Fetch all collections in the specified workspace
  const response = await axios.get(
    `https://api.getpostman.com/collections?workspace=${workspaceid}`,
    {
      headers: { "X-Api-Key": apiKey },
    }
  );

  const allCollections = response.data.collections;

  // Check if the specified collection already exists
  const existingCollection = allCollections.find(
    (collection: any) => collection.name === collectionName
  );

  let collectionId;

  // Create a new collection if it doesn't exist
  if (existingCollection) {
    collectionId = existingCollection.id;
  } else {
    const collectionResponse = await axios.post(
      "https://api.getpostman.com/collections",
      {
        collection: {
          info: {
            name: collectionName,
            description: "Requests for my autogenerated API module",
            schema:
              "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
          },
          item: [],
          workspace: `${workspaceid}`,
          variables: [
            {
              key: "url",
              value: "http://localhost:3000",
              type: "string",
            },
          ],
        },
      },
      {
        headers: { "X-Api-Key": apiKey },
      }
    );

    collectionId = collectionResponse.data.collection.id;
  }

  // Retrieve the existing collection to modify it
  const collection = await isExistCollectionByID(apiKey, collectionId);

  // Map requests into the format expected by Postman
  const requests = requestsArray.map((request: request) => {
    // Prepare form data items if needed
    const formDataItems =
      isFormData && request.body
        ? Object.entries(request.body).map(([key, value]) => {
            const foundFileField = fileFieldData?.find(
              (field) => field.fieldName === key
            );
            return {
              key,
              value: String(value),
              type: foundFileField ? "file" : "text",
              enabled: true,
            };
          })
        : [];

    return {
      name: request.name,
      request: {
        method: request.method,
        header: [
          {
            key: "Content-Type",
            value: isFormData ? "multipart/form-data" : "application/json",
            type: "text",
          },
        ],
        body: isFormData
          ? {
              mode: "formdata",
              formdata: formDataItems,
            }
          : request.body
          ? {
              mode: "raw",
              raw: JSON.stringify(request.body, null, 2),
              options: {
                raw: {
                  language: "json",
                },
              },
            }
          : undefined,
        url: {
          raw: request.url,
          host: ["{{url}}"],
          path: request.url.replace("{{url}}", "").split("/").filter(Boolean),
        },
        auth: request.token
          ? {
              type: "bearer",
              bearer: [
                {
                  key: "token",
                  value: request.token,
                  type: "string",
                },
              ],
            }
          : undefined,
      },
      response: [],
    };
  });

  // Create a new folder with its own requests
  const newFolder = {
    name: folderName.toUpperCase(),
    item: requests,
  };

  // Update the collection with the modified items
  try {
    const updatePayload = {
      collection: {
        info: {
          ...collection.info,
          schema:
            "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        },
        item: [...collection.item, newFolder],
      },
    };

    console.log(
      "Updating collection with payload:",
      JSON.stringify(updatePayload, null, 2)
    );

    const updateResponse = await axios.put(
      `https://api.getpostman.com/collections/${collectionId}`,
      updatePayload,
      {
        headers: {
          "X-Api-Key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    return updateResponse.data;
  } catch (error: any) {
    console.error(
      "Error updating collection:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Example usage:
// automatePostman(
//   process.env.POSTMAN_API_KEY,
//   process.env.POSTMAN_FOLDER_NAME,
//   process.env.POSTMAN_WORKSPACE_ID,
//   process.env.POSTMAN_COLLECTION_NAME,
//   [
//     {
//       name: 'Create User',
//       method: 'POST',
//       url: 'https://reqres.in/api/users',
//       token: 'QpwL5tke4Pnpja7X4',
//       body: {
//         name: 'John Doe',
//         job: 'Software Engineer',
//       },
//     },
//     {
//       name: 'Get User',
//       method: 'GET',
//       url: 'https://reqres.in/api/users/2',
//     },
//     {
//       name: 'Update User',
//       method: 'PUT',
//       url: 'https://reqres.in/api/users/2',
//       token: 'QpwL5tke4Pnpja7X4',
//       body: {
//         name: 'John Doe',
//         job: 'Software Engineer',
//       },
//     },
//     {
//       name: 'Delete User',
//       method: 'DELETE',
//       url: 'https://reqres.in/api/users/2',
//       token: 'QpwL5tke4Pnpja7X4',
//     },
//   ]
// ).then(data => console.log(data));
