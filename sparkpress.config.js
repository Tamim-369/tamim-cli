const dotenv = require('dotenv');

dotenv.config();

const config = {
  postman_api_key:
    'PMAK-6736b96ccbb06e00018c2086-b6e7c760ec61406708332f784ba867dd99',
  postman_workspace_id: 'b8ccff14-fb51-43d5-950a-b37fb651ad73',
  postman_collection_name: 'test4',
  mongodb_uri: 'mongodb://localhost:27017/sparkpress',
};

module.exports = { config };
