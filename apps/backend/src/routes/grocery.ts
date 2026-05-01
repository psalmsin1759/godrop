import { Router } from "express";
import * as groceryController from "../controllers/groceryController";

const router = Router();

router.get("/stores", groceryController.listStores);
router.get("/stores/:id", groceryController.getStore);
router.get("/stores/:id/products", groceryController.getProducts);
router.get("/search", groceryController.searchGrocery);

export default router;
