import { Request, Response } from "express";
import { profileService } from "@/services/profileService";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { idNumber } = req.params;
    const profile = await profileService.getProfile(idNumber);
    res.json(profile);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const updateName = async (req: Request, res: Response) => {
  try {
    const { idNumber, username } = req.body;
    const result = await profileService.updateName(idNumber, username);
    res.json({ success: true, username: result.username });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updatePhoto = async (req: Request, res: Response) => {
  try {
    const { idNumber, imageBase64 } = req.body;
    if (!idNumber || !imageBase64) {
      return res.status(400).json({ error: "Missing idNumber or image" });
    }
    const result = await profileService.updatePhoto(idNumber, imageBase64);
    res.json({ success: true, userImg: result.userImg });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};