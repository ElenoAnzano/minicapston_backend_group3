import { Router } from "express";
import { getProfile, updateName, updatePhoto } from "@/controllers/profileController"

const router = Router();

// GET profile (name + photo)
router.get("/:idNumber", getProfile);

// Update name
router.post("/update-name", updateName);

// Update profile photo
router.post("/update-photo", updatePhoto);

export default router;