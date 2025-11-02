import { Router } from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import {
  createSection,
  getSections,
  updateSectionOrder,
  updateChannelOrder,
  deleteSection,
} from "../controllers/section.controller.js";

const router = Router();

router.use(protectRoute);

router.post("/", createSection);
router.get("/", getSections);
router.put("/order", updateSectionOrder);
router.put("/channels/order", updateChannelOrder);
router.delete("/:id", deleteSection);

export default router;
