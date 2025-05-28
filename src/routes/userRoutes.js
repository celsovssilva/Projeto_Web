import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  deleteUser,
  updateUser
} from "../controllers/userController.js";

const router = express.Router();

router.get("/userCad", (req, res) => {
  res.render("cadastro"); 
});


router.get("/user",  verificarToken ,getUsers);
router.get("/user/:userId",  verificarToken, getUserById);
router.post("/userCad",  verificarToken, createUser);
router.put("/user/:userId",  verificarToken, updateUser);
router.delete("/user/:userId",  verificarToken,deleteUser);


export default router;