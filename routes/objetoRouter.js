import { Router } from "express";
import {create} from "../controllers/objetoController.js";

const router = Router();

import verifyToken from "../helpers/verify-token.js"
import imageUpload from "../helpers/image-upload.js";

router.post("/", verifyToken, imageUpload.array("images", 10), create);
router.get("/myobjects", verifyToken, imageUpload.array("images",)  )

export default router;