import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  deleteUser,
  updateUser,
  dataUser
} from "../controllers/userController.js";
import { authenticateToken } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.get("/userCad", (req, res) => {
  res.render("cadastro"); 
});

router.get("/dataUser", authenticateToken, dataUser);


router.get("/user" ,getUsers);
router.get("/user/:userId", getUserById);
router.post("/userCad", createUser);
router.put("/user/:userId", updateUser);
router.delete("/user/:userId", deleteUser);


export default router;