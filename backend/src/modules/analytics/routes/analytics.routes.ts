import { Router } from "express";
import { analyticsController } from "../controllers/analytics.controller";
import { analyticsSchema } from "../validation/analytic.validation";
import { validate } from "../../../middlewares/validate";

const router = Router();

router.get(
    "/:id/analytics",
    validate(analyticsSchema),
    analyticsController.getAnalytics
)

export default router