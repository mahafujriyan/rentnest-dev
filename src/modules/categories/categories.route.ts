import { Router } from "express";
import { getCategories } from "./categories.controller";

export const categoryRoutes = Router();

categoryRoutes.get("/", getCategories);
