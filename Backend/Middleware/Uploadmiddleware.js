import multer                  from "multer";
import { CloudinaryStorage }   from "multer-storage-cloudinary";
import cloudinary              from "../Config/Cloudinary.js";

/* ============================================================
   CLOUDINARY STORAGE — Profile Pictures
   ============================================================ */
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         "tradesphere/avatars",   // folder in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" }, // auto crop to face
      { quality: "auto", fetch_format: "auto" },                  // auto optimize
    ],
    public_id: (req, file) => `user_${req.user._id}_${Date.now()}`,
  },
});

/* ── File filter — images only ───────────────────────────── */
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpg, png, webp)"), false);
  }
};

/* ── Upload middleware — single profile pic ──────────────── */
export const uploadAvatar = multer({
  storage: profileStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
}).single("avatar");             // field name in form-data

/* ============================================================
   CLOUDINARY STORAGE — General (for future use)
   ============================================================ */
const generalStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          "tradesphere/general",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
    transformation:  [{ quality: "auto", fetch_format: "auto" }],
  },
});

export const uploadGeneral = multer({
  storage:    generalStorage,
  fileFilter: imageFilter,
  limits:     { fileSize: 10 * 1024 * 1024 }, // 10MB
}).single("file");

/* ============================================================
   DELETE FROM CLOUDINARY
   Pass the public_id to delete an old image
   ============================================================ */
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
    console.log(`🗑️  Deleted from Cloudinary: ${publicId}`);
  } catch (err) {
    console.error("❌ Cloudinary delete failed:", err.message);
  }
};

/* ============================================================
   EXTRACT PUBLIC ID from Cloudinary URL
   Use this to get the public_id before deleting old avatar
   ============================================================ */
export const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  try {
    const parts    = url.split("/");
    const filename = parts[parts.length - 1].split(".")[0];
    const folder   = parts[parts.length - 2];
    return `${folder}/${filename}`;
  } catch {
    return null;
  }
};