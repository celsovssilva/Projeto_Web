import express from "express";
import cors from "cors";
import userRoutes from "./src/routes/userRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import loginRoutes from "./src/routes/loginRouters.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", loginRoutes);
app.use("/api", userRoutes);
app.use("/api", adminRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
