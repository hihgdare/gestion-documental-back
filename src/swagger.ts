import { existsSync } from 'fs';
import { resolve } from 'path';
import swaggerAutogen from 'swagger-autogen';

export const outputFile = resolve(__dirname, '../swagger.json');
const routes = [resolve(__dirname, './app.ts')];

const options = {
  info: {
    version: "1.0.0",
    title: 'Gestion Documental',
    description: 'Gestion Documental',
  },
  host: 'localhost:3000',
  basePath: "/",
  schemes: ['http', 'https'],
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    {
      "name": "User",
      "description": "Endpoints",
    },
  ],
  securityDefinitions: {
    // api_key: {
    //   type: "apiKey",
    //   name: "api_key",
    //   in: "header",
    // },
    // petstore_auth: {
    //   type: "oauth2",
    //   authorizationUrl: "https://petstore.swagger.io/oauth/authorize",
    //   flow: "implicit",
    //   scopes: {
    //     read_pets: "read your pets",
    //     write_pets: "modify pets in your account",
    //   },
    // },
  },
  definitions: {
    // User: {
    //   name: "Jhon Doe",
    //   age: 29,
    //   diplomas: [
    //     {
    //       school: "XYZ University",
    //       year: 2020,
    //       completed: true,
    //       internship: {
    //         hours: 290,
    //         location: "XYZ Company",
    //       },
    //     },
    //   ],
    // },
  },
};

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the
root file where the route starts, such as index.js, app.js, routes.js, etc ... */
const swaggerInstance = swaggerAutogen({openapi: '3.0.0'});

export async function swaggerGenerator(force = false) {
  if (existsSync(outputFile) && !force) return true;
  console.log('Generating swagger documentation...');
  const response = await swaggerInstance(outputFile, routes, options);
  return response === false ? false : response.success;
}
