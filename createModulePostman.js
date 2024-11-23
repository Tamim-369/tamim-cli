const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const isExistCollectionByID = async (apiKey, collectionId) => {
  const response = await axios.get(
    `https://api.getpostman.com/collections/${collectionId}`,
    {
      headers: { 'X-Api-Key': apiKey },
    }
  );
  if (!response.data.collection) {
    console.log('Collection not found');
    throw new Error('Collection not found');
  }
  return response.data.collection;
};

const automatePostman = async (
  apiKey,
  folderName,
  workspaceid,
  collectionName,
  requestsArray
) => {
  if (!Array.isArray(requestsArray)) {
    console.log('requestsArray must be an array');
    throw new Error('requestsArray must be an array');
  }

  // Fetch all collections in the specified workspace
  const response = await axios.get(
    `https://api.getpostman.com/collections?workspace=${workspaceid}`,
    {
      headers: { 'X-Api-Key': apiKey },
    }
  );

  const allCollections = response.data.collections;

  // Check if the specified collection already exists
  const existingCollection = allCollections.find(
    collection => collection.name === collectionName
  );

  let collectionId;

  // Create a new collection if it doesn't exist
  if (existingCollection) {
    collectionId = existingCollection.id;
  } else {
    const collectionResponse = await axios.post(
      'https://api.getpostman.com/collections',
      {
        collection: {
          info: {
            name: collectionName,
            description: 'Requests for my autogenerated API module',
            schema:
              'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
          },
          item: [],
          workspace: `${workspaceid}`,
          variables: [
            {
              key: 'url',
              value: 'http://localhost:3000',
              type: 'string',
            },
          ],
        },
      },
      {
        headers: { 'X-Api-Key': apiKey },
      }
    );

    collectionId = collectionResponse.data.collection.id;
  }

  // Retrieve the existing collection to modify it
  const collection = await isExistCollectionByID(apiKey, collectionId);

  // Map requests into the format expected by Postman
  const requests = requestsArray.map(request => ({
    name: request.name,
    request: {
      method: request.method,
      url: request.url,
      header: [
        {
          key: 'Authorization',
          value: `Bearer ${request.token || ''}`,
        },
        {
          key: 'Content-Type',
          value: 'application/json', // Set Content-Type to application/json
        },
      ],
      body: {
        mode: 'raw',
        raw: JSON.stringify(request.body, null, 4),
      },
    },
  }));

  // Create a new folder with its own requests
  const newFolder = {
    name: folderName,
    item: requests, // Add only the requests for this folder
  };

  // Add the new folder to the existing items without modifying others
  collection.item.push(newFolder);

  // Update the collection with the modified items
  const updateResponse = await axios.put(
    `https://api.getpostman.com/collections/${collectionId}`,
    {
      collection: {
        ...collection,
        item: collection.item, // Ensure you're updating with the correct item structure
      },
    },
    {
      headers: { 'X-Api-Key': apiKey },
    }
  );

  return updateResponse.data;
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

module.exports = { automatePostman };
