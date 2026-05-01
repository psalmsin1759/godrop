import { Router } from "express";
import * as retailController from "../controllers/retailController";

const router = Router();

router.get("/stores", retailController.listStores);
router.get("/stores/:id", retailController.getStore);
router.get("/stores/:id/products", retailController.getProducts);
router.get("/categories", retailController.listCategories);
router.get("/search", retailController.searchRetail);

export default router;
