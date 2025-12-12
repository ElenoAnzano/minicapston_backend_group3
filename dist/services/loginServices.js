"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const loginRepo_1 = require("../repositories/loginRepo");
exports.authService = {
    // REGISTER - with duplicate ID check
    async register(idNumber, password) {
        // Validate: exactly 8 digits
        if (!/^\d{8}$/.test(idNumber)) {
            throw new Error("ID must be exactly 8 digits");
        }
        const trimmedId = idNumber.trim();
        // Check if ID already exists
        const existingUser = await loginRepo_1.prisma.user.findUnique({
            where: { idNumber: trimmedId },
            select: { id: true }, // we only need to know if it exists
        });
        if (existingUser) {
            throw new Error("This ID number is already registered. Please use a different ID or login.");
        }
        // Proceed with registration
        const hashed = await bcryptjs_1.default.hash(password, 10);
        return await loginRepo_1.prisma.user.create({
            data: {
                idNumber: trimmedId,
                password: hashed,
                role: "student"
            },
        });
    },
    // LOGIN
    async login(idNumber, password) {
        const user = await loginRepo_1.prisma.user.findUnique({
            where: { idNumber },
            select: {
                id: true,
                idNumber: true,
                role: true,
                password: true
            }
        });
        if (!user)
            throw new Error("Invalid ID or password");
        const match = await bcryptjs_1.default.compare(password, user.password);
        if (!match)
            throw new Error("Invalid ID or password");
        return {
            id: user.id,
            idNumber: user.idNumber,
            role: user.role
        };
    },
    async resetPassword(idNumber, newPassword, confirmPassword, password) {
        if (!/^\d{8}$/.test(idNumber)) {
            throw new Error("ID must be exactly 8 digits");
        }
        //Only checking if ID exists Step 1 from frontend
        if (!newPassword && !confirmPassword && !password) {
            const user = await loginRepo_1.prisma.user.findUnique({
                where: { idNumber },
            });
            if (!user) {
                throw new Error("ID not found");
            }
            //ID exists → allow frontend to go to step 2
            return { message: "ID verified", success: true };
        }
        //Full password reset Step 2
        const pwd = newPassword || password;
        const confirm = confirmPassword || password;
        if (!pwd)
            throw new Error("Password is required");
        if (pwd !== confirm)
            throw new Error("Passwords do not match");
        if (pwd.length < 6)
            throw new Error("Password must be at least 6 characters");
        const user = await loginRepo_1.prisma.user.findUnique({ where: { idNumber } });
        if (!user)
            throw new Error("ID not found");
        const hashed = await bcryptjs_1.default.hash(pwd, 10);
        await loginRepo_1.prisma.user.update({
            where: { idNumber },
            data: { password: hashed },
        });
        return { message: "Password reset successfully!" };
    }
};
//# sourceMappingURL=loginServices.js.map