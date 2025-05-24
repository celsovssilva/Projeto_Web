import express from "express";
import cors from "cors";

import userRoutes from "./src/routes/userRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import passwordRoutes from "./src/routes/passwordRoutes.js";




const app = express();

app.use(cors());
app.use(express.json());


app.use("/api", userRoutes);
app.use("/api", adminRoutes);
app.use("/api", authRoutes)
app.use("/api", passwordRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
