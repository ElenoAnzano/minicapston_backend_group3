import bcrypt from "bcryptjs";
import { prisma } from "@/repositories/loginRepo";

export const authService = {
  // REGISTER - with duplicate ID check
async register(idNumber: string, password: string) {
  // Validate: exactly 8 digits
  if (!/^\d{8}$/.test(idNumber)) {
    throw new Error("ID must be exactly 8 digits");
  }

  const trimmedId = idNumber.trim();

  // Check if ID already exists
  const existingUser = await prisma.user.findUnique({
    where: { idNumber: trimmedId },
    select: { id: true }, // we only need to know if it exists
  });

  if (existingUser) {
    throw new Error("This ID number is already registered. Please use a different ID or login.");
  }

  // Proceed with registration
  const hashed = await bcrypt.hash(password, 10);
  return await prisma.user.create({
    data: { 
      idNumber: trimmedId, 
      password: hashed, 
      role: "student" 
    },
  });
},

  // LOGIN
  async login(idNumber: string, password: string) {
    const user = await prisma.user.findUnique({ 
      where: { idNumber },
      select: { 
        id: true,           
        idNumber: true, 
        role: true, 
        password: true 
      }
    });

    if (!user) throw new Error("Invalid ID or password");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Invalid ID or password");

    
    return { 
      id: user.id,           
      idNumber: user.idNumber, 
      role: user.role 
    };
  },

  async resetPassword(
  idNumber: string,
  newPassword?: string,
  confirmPassword?: string,
  password?: string
) {
  if (!/^\d{8}$/.test(idNumber)) {
    throw new Error("ID must be exactly 8 digits");
  }

  //Only checking if ID exists Step 1 from frontend
  if (!newPassword && !confirmPassword && !password) {
    const user = await prisma.user.findUnique({
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

  if (!pwd) throw new Error("Password is required");
  if (pwd !== confirm) throw new Error("Passwords do not match");
  if (pwd.length < 6) throw new Error("Password must be at least 6 characters");

  const user = await prisma.user.findUnique({ where: { idNumber } });
  if (!user) throw new Error("ID not found");

  const hashed = await bcrypt.hash(pwd, 10);
  await prisma.user.update({
    where: { idNumber },
    data: { password: hashed },
  });

  return { message: "Password reset successfully!" };
}
};