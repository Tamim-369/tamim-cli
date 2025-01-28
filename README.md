# Tamim CLI

A powerful CLI tool for generating TypeScript-based module boilerplate code with MongoDB and Express.js integration. Created by Ashiqur Rahman Tamim.

## Features

- 🚀 Instantly generate complete module structure
- 📁 Creates all necessary files (routes, controllers, services, models, etc.)
- 🔄 Automatic Postman collection generation
- 📝 TypeScript support out of the box
- 🗃️ MongoDB model generation
- 🛣️ Express.js route setup
- ✨ Built-in validation templates
- 📦 File upload handling support

## Installation

```bash
npm install -g tamim-cli
```

## Usage

### Create a New Project

```bash
tamim create-new-app
```

It will ask about the name of the app and the package manager you want to use once you answer those it will create a folder structure like this

```
├── node_modules
├── src
│   ├── app
│   │   ├── middlewares
│   │   │   ├── auth.ts
│   │   │   ├── fileUploadHandler.ts
│   │   │   ├── globalErrorHandler.ts
│   │   │   └── validateRequest.ts
│   │   └── modules
│   │       ├── auth
│   │       ├── resetToken
│   │       └── user
│   ├── app.ts
│   ├── config
│   │   └── index.ts
│   ├── enums
│   │   └── user.ts
│   ├── errors
│   │   ├── ApiError.ts
│   │   ├── handleValidationError.ts
│   │   └── handleZodError.ts
│   ├── helpers
│   │   ├── emailHelper.ts
│   │   ├── jwtHelper.ts
│   │   ├── paginationHelper.ts
│   │   └── socketHelper.ts
│   ├── routes
│   │   └── index.ts
│   ├── seed
│   │   └── seedAdmin.ts
│   ├── server.ts
│   ├── shared
│   │   ├── catchAsync.ts
│   │   ├── constrant.ts
│   │   ├── emailTemplate.ts
│   │   ├── logger.ts
│   │   ├── morgen.ts
│   │   ├── pick.ts
│   │   ├── sendResponse.ts
│   │   └── unlinkFile.ts
│   ├── types
│   │   ├── auth.ts
│   │   ├── emailTamplate.ts
│   │   ├── email.ts
│   │   ├── errors.types.ts
│   │   ├── index.d.ts
│   │   └── pagination.ts
│   └── util
│       ├── cryptoToken.ts
│       └── generateOTP.ts
├── tsconfig.json
├── package.json
├── README.md
└── yarn.lock

```

### Create a New Module

```bash
tamim create <module-name> <fields...>
```

Fields should be specified in the format: `fieldName:type`

Supported field types:

- `string`
- `number`
- `date`
- `boolean`
- `array=>string`
- `array=>number`
- `array=>date`
- `array=>boolean`
- `ref=>ModelName` (for MongoDB references)
- `array=>ref=>ModelName` (for array of references)

Example:

```bash
tamim create user name:string email:string age:number profileImage:string isActive:boolean
```

This will create:

- user.route.ts
- user.controller.ts
- user.service.ts
- user.validation.ts
- user.interface.ts
- user.model.ts

Supported file types:

- `route`
- `controller`
- `service`
- `validation`
- `interface`
- `model`

If you add --skip or -s and give the file types you want to skip then it will not create that file

Example:

```bash
tamim create user name:string email:string age:number profileImage:string isActive:boolean --skip route validation
```

This will skip route and validation and just create:

- user.controller.ts
- user.service.ts
- user.interface.ts
- user.model.ts

And there is also a twist if you use `--skip filter` or `-s filter` it will skip the filter and pagination part in the getall function

### Add Files to Existing Module

```bash
tamim add <moduleFiles...>
```

```bash
tamim add user:route
```

This will create:

- user.route.ts

in the user folder

```bash
tamim add user/auth:route
```

This will create:

- auth.route.ts

in the auth folder in the user folder

## Configuration (Optional)

Create a `tamim.config.cjs` file in your project root if you want to add api requests automatically in your postman collection:

```javascript
module.exports = {
  config: {
    postman_api_key: "your-postman-api-key",
    postman_workspace_id: "your-workspace-id",
    postman_collection_name: "your-collection-name",
    postman_folder_name: "optional-folder-name", // defaults to module name
  },
};
```

## Generated Structure

For each module, the following structure is created under `src/app/modules/<module-name>/`:

```
📁 <module-name>/
 ├── <module-name>.route.ts      # Express routes
 ├── <module-name>.controller.ts  # Request handlers
 ├── <module-name>.service.ts     # Business logic
 ├── <module-name>.validation.ts  # Request validation
 ├── <module-name>.interface.ts   # TypeScript interfaces
 └── <module-name>.model.ts       # MongoDB model
```

## Postman Integration

If configured, automatically generates Postman collection with:

- Create endpoint (POST)
- Get One endpoint (GET)
- Get All endpoint (GET)
- Update endpoint (PATCH)
- Delete endpoint (DELETE)

## Requirements

- Node.js >= 18.0.0
- TypeScript project setup
- MongoDB for database operations

## Author

**Ashiqur Rahman Tamim**  
Email: ashiqurrahmantamim369@gmail.com\
Repo: [https://github.com/Tamim-369/tamim-cli](https://github.com/Tamim-369/tamim-cli)

## License

MIT
