import express from "express";
import cors from "cors";
import router from "./routes";
import loginRoutes from "./routes/loginRoutes";
import profileRoutes from "./routes/profileRoutes";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/dashboard", router);

app.get("/", (req, res) => {
  res.json({ message: "API is working" });
});

//login
app.use("/api/login", loginRoutes);

//profile
app.use("/api/profile", profileRoutes);


export default app;


