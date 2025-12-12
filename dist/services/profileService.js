"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileService = void 0;
const profileRepository_1 = require("../repositories/profileRepository");
class ProfileService {
    async getProfile(idNumber) {
        const profile = await profileRepository_1.profileRepository.getProfile(idNumber);
        if (!profile)
            throw new Error("Profile not found");
        return profile;
    }
    async updateName(idNumber, username) {
        return await profileRepository_1.profileRepository.updateUsername(idNumber, username.trim());
    }
    async updatePhoto(idNumber, imageBase64) {
        if (!imageBase64.startsWith("data:image/")) {
            throw new Error("Invalid image format");
        }
        return await profileRepository_1.profileRepository.updateProfilePhoto(idNumber, imageBase64);
    }
}
exports.profileService = new ProfileService();
//# sourceMappingURL=profileService.js.map