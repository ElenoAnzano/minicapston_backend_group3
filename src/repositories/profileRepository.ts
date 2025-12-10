import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class ProfileRepository {
  async getProfile(idNumber: string) {
    return prisma.user.findUnique({
      where: { idNumber },
      select: { username: true, userImg: true, idNumber: true, role: true },
    });
  }

  async updateUsername(idNumber: string, username: string) {
    console.log("REPOSITORY RECEIVED idNumber:", idNumber, "| username:", username);
    return prisma.user.update({
      where: { idNumber },
      data: { username },
      select: { username: true },
    });
  }

  async updateProfilePhoto(idNumber: string, imageBase64: string) {
    return prisma.user.update({
      where: { idNumber },
      data: { userImg: imageBase64 },
      select: { userImg: true },
    });
  }
}

export const profileRepository = new ProfileRepository();