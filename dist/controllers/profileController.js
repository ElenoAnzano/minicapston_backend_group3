"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePhoto = exports.updateName = exports.getProfile = void 0;
const profileService_1 = require("../services/profileService");
const getProfile = async (req, res) => {
    try {
        const { idNumber } = req.params;
        const profile = await profileService_1.profileService.getProfile(idNumber);
        res.json(profile);
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
};
exports.getProfile = getProfile;
const updateName = async (req, res) => {
    try {
        const { idNumber, username } = req.body;
        const result = await profileService_1.profileService.updateName(idNumber, username);
        res.json({ success: true, username: result.username });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updateName = updateName;
const updatePhoto = async (req, res) => {
    try {
        const { idNumber, imageBase64 } = req.body;
        if (!idNumber || !imageBase64) {
            return res.status(400).json({ error: "Missing idNumber or image" });
        }
        const result = await profileService_1.profileService.updatePhoto(idNumber, imageBase64);
        res.json({ success: true, userImg: result.userImg });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updatePhoto = updatePhoto;
//# sourceMappingURL=profileController.js.map