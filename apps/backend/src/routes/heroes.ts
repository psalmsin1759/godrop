import { Router } from "express";
import { listPublicHeroes } from "../controllers/heroController";

const router = Router();

// Public — landing page fetches active heroes from here
router.get("/", listPublicHeroes);

export default router;
