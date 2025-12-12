"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileRepository = void 0;
const client_1 = require(".prisma/client");
const prisma = new client_1.PrismaClient();
class ProfileRepository {
    async getProfile(idNumber) {
        return prisma.user.findUnique({
            where: { idNumber },
            select: { username: true, userImg: true, idNumber: true, role: true },
        });
    }
    async updateUsername(idNumber, username) {
        console.log("REPOSITORY RECEIVED idNumber:", idNumber, "| username:", username);
        return prisma.user.update({
            where: { idNumber },
            data: { username },
            select: { username: true },
        });
    }
    async updateProfilePhoto(idNumber, imageBase64) {
        return prisma.user.update({
            where: { idNumber },
            data: { userImg: imageBase64 },
            select: { userImg: true },
        });
    }
}
exports.profileRepository = new ProfileRepository();
//# sourceMappingURL=profileRepository.js.map