import { Router } from "express";
import { checkUser, checkUserById, editUser, login, register } from "../controllers/usuarioController.js";

//MIDDLEWARES / helpers
import verifyToken from "../helpers/verify-token.js";
import imageUpload from "../helpers/image-upload.js";

const router = Router()

router.post("/register", register);
router.post("/login", login);
router.get("/checkuser", checkUser);
router.get("/:id", checkUserById);
router.put("/edit/:id", verifyToken, imageUpload.single("imagem"), editUser);

export default router;