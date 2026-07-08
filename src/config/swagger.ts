import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RentNest API",
      version: "1.0.0",
      description: "Rental Property Marketplace Backend API"
    },
    servers: [{ url: `http://localhost:${env.PORT}/api`, description: "Development" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ["./src/modules/**/*.route.ts"]
});
