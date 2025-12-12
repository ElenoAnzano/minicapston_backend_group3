"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const loginRoutes_1 = __importDefault(require("./routes/loginRoutes"));
const profileRoutes_1 = __importDefault(require("./routes/profileRoutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.use(express_1.default.json());
app.use("/api/dashboard", routes_1.default);
app.get("/", (req, res) => {
    res.json({ message: "API is working" });
});
//login
app.use("/api/login", loginRoutes_1.default);
//profile
app.use("/api/profile", profileRoutes_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map