import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { postReview } from "./reviews.controller";
import { createReviewSchema } from "./reviews.validation";

export const reviewRoutes = Router();

reviewRoutes.post("/", auth("TENANT"), validateRequest(createReviewSchema), postReview);
