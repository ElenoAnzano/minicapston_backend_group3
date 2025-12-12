import { profileRepository } from "../repositories/profileRepository";

class ProfileService {
  async getProfile(idNumber: string) {
    const profile = await profileRepository.getProfile(idNumber);
    if (!profile) throw new Error("Profile not found");
    return profile;
  }

  async updateName(idNumber: string, username: string) {
    return await profileRepository.updateUsername(idNumber, username.trim());
  }

  async updatePhoto(idNumber: string, imageBase64: string) {
    if (!imageBase64.startsWith("data:image/")) {
      throw new Error("Invalid image format");
    }
    return await profileRepository.updateProfilePhoto(idNumber, imageBase64);
  }
}

export const profileService = new ProfileService();