import { Router, Request } from "express";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import { upload } from "../middleware/upload";
import * as disputeCtrl from "../controllers/disputeController";
import {
  createMyDisputeSchema,
  myDisputeQuerySchema,
  addMyMessageSchema,
} from "../validators/disputeValidators";

const router = Router();

router.use(requireAuth);

const customerActor = (req: Request) => ({ type: "CUSTOMER" as const, id: req.user!.id });

router.post("/upload", upload.single("file"), disputeCtrl.uploadDisputeEvidence);
router.post("/", validate(createMyDisputeSchema), disputeCtrl.createMyDispute(customerActor));
router.get("/", validate(myDisputeQuerySchema, "query"), disputeCtrl.listMyDisputes(customerActor));
router.get("/unread-count", disputeCtrl.getMyDisputesUnreadCount(customerActor));
router.get("/:id", disputeCtrl.getMyDispute(customerActor));
router.post("/:id/messages", validate(addMyMessageSchema), disputeCtrl.addMyMessage(customerActor));

export default router;
