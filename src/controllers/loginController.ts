import { Request, Response } from "express";
import { authService } from "../services/loginServices";

export const register = async (req: Request, res: Response) => {
  try {
    const { idNumber, password } = req.body;
    const user = await authService.register(idNumber, password);
    
    res.status(201).json({
      message: "Account created!",
      loginId: user.idNumber
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { idNumber, password } = req.body;
    
    const user = await authService.login(idNumber, password);

    // THIS IS THE ONLY CORRECT RESPONSE — INCLUDES UUID!
    res.json({
      message: "Login successful",
      user: {
        id: user.id,           
        idNumber: user.idNumber,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { idNumber, newPassword, confirmPassword, password } = req.body;
    
    const result = await authService.resetPassword(
      idNumber,
      newPassword,
      confirmPassword,
      password
    );
    
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }

};
