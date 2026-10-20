import { prisma } from "../db.js";
import { cloudinary } from "../config/cloudinary.js";
import multer from "multer";

const profileSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  avatar: true,
  createdAt: true,
};

export const uploadProfileAvatar = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const supported = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!supported.has(file.mimetype)) {
      return callback(new Error("Choose a JPEG, PNG, or WebP image."));
    }
    callback(null, true);
  },
}).single("avatar");

const normalizePhone = (value) => {
  const compact = value.trim().replace(/[\s()-]/g, "");
  const digits = compact.replace(/^\+/, "").replace(/^977/, "");
  if (!/^9[78]\d{8}$/.test(digits)) return null;
  return `+977${digits}`;
};

const getImageFormat = (buffer) => {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
};

const uploadToCloudinary = (buffer) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    { folder: "khaana/avatars", resource_type: "image" },
    (error, result) => error ? reject(error) : resolve(result),
  );
  stream.end(buffer);
});

const validationError = (res, field, message) => res.status(400).json({
  success: false,
  message,
  errors: { [field]: message },
});

export const getMyProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: profileSelect });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    return res.json({ success: true, user });
  } catch (error) {
    console.error("Get profile failed:", error);
    return res.status(500).json({ success: false, message: "Could not load your profile." });
  }
};

export const updateMyProfile = async (req, res) => {
  let uploadedPublicId;
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim().replace(/\s+/g, " ") : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const phone = typeof req.body.phone === "string" ? normalizePhone(req.body.phone) : null;

    if (name.length < 2 || name.length > 80) return validationError(res, "name", "Full name must be between 2 and 80 characters.");
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return validationError(res, "email", "Please enter a valid email address.");
    if (!phone) return validationError(res, "phone", "Please enter a valid Nepal mobile number.");

    const [emailOwner, phoneOwner] = await Promise.all([
      prisma.user.findFirst({ where: { email, NOT: { id: req.user.id } }, select: { id: true } }),
      prisma.user.findFirst({ where: { phone, NOT: { id: req.user.id } }, select: { id: true } }),
    ]);
    if (emailOwner) return res.status(409).json({ success: false, message: "This email is already registered.", errors: { email: "This email is already registered." } });
    if (phoneOwner) return res.status(409).json({ success: false, message: "This phone number is already associated with another account.", errors: { phone: "This phone number is already associated with another account." } });

    if (req.file) {
      const detectedType = getImageFormat(req.file.buffer);
      if (!detectedType || detectedType !== req.file.mimetype) {
        return validationError(res, "avatar", "The uploaded file is not a valid JPEG, PNG, or WebP image.");
      }
      const uploaded = await uploadToCloudinary(req.file.buffer);
      uploadedPublicId = uploaded.public_id;
      req.body.avatar = uploaded.secure_url;
    }

    const data = { name, email, phone };
    if (req.file) data.avatar = req.body.avatar;
    else if (req.body.removeAvatar === "true") data.avatar = null;

    const user = await prisma.user.update({ where: { id: req.user.id }, data, select: profileSelect });
    return res.json({ success: true, message: "Profile updated successfully.", user });
  } catch (error) {
    if (uploadedPublicId) {
      try { await cloudinary.uploader.destroy(uploadedPublicId); } catch (cleanupError) { console.error("Avatar cleanup failed:", cleanupError); }
    }
    if (error?.code === "P2002") {
      const target = Array.isArray(error.meta?.target) ? error.meta.target.join(" ") : String(error.meta?.target || "");
      const field = target.toLowerCase().includes("phone") ? "phone" : "email";
      const message = field === "phone" ? "This phone number is already associated with another account." : "This email is already registered.";
      return res.status(409).json({ success: false, message, errors: { [field]: message } });
    }
    console.error("Update profile failed:", error);
    return res.status(500).json({ success: false, message: "Could not update your profile. Please try again." });
  }
};

export const handleAvatarUploadError = (error, _req, res, next) => {
  if (error instanceof multer.MulterError) {
    const message = error.code === "LIMIT_FILE_SIZE" ? "Profile pictures must be 5 MB or smaller." : "Only one profile picture can be uploaded at a time.";
    return res.status(400).json({ success: false, message, errors: { avatar: message } });
  }
  if (error) return res.status(400).json({ success: false, message: error.message, errors: { avatar: error.message } });
  return next();
};