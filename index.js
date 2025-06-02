import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash";
import path from "path";
import { fileURLToPath } from "url";
import methodOverride from "method-override";

import userRoutes from "./src/routes/userRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import passwordRoutes from "./src/routes/passwordRoutes.js";
import eventsRoutes from "./src/routes/eventsRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());

app.use(session({
  secret: "mySecretKey",
  resave: false,
  saveUninitialized: true
}));

app.use(flash());

app.use("/api", userRoutes);
app.use("/api", adminRoutes);
app.use("/api", authRoutes);
app.use("/api", passwordRoutes);
app.use("/api",eventsRoutes);

app.get("/", (req, res) => {
  res.render("landingPage");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
