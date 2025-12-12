"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.login = exports.register = void 0;
const loginServices_1 = require("../services/loginServices");
const register = async (req, res) => {
    try {
        const { idNumber, password } = req.body;
        const user = await loginServices_1.authService.register(idNumber, password);
        res.status(201).json({
            message: "Account created!",
            loginId: user.idNumber
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { idNumber, password } = req.body;
        const user = await loginServices_1.authService.login(idNumber, password);
        // THIS IS THE ONLY CORRECT RESPONSE — INCLUDES UUID!
        res.json({
            message: "Login successful",
            user: {
                id: user.id,
                idNumber: user.idNumber,
                role: user.role
            }
        });
    }
    catch (error) {
        res.status(401).json({ message: error.message });
    }
};
exports.login = login;
const resetPassword = async (req, res) => {
    try {
        const { idNumber, newPassword, confirmPassword, password } = req.body;
        const result = await loginServices_1.authService.resetPassword(idNumber, newPassword, confirmPassword, password);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=loginController.js.map