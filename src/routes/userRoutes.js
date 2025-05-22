import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  deleteUser,
  updateUser
} from "../controllers/userController.js";

const router = express.Router();

router.get("/user", getUsers);
router.get("/user/:userId", getUserById);
router.post("/user", createUser);
router.put("/user/:userId", updateUser);
router.delete("/user/:userId", deleteUser);


export default router;