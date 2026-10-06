import multer from "multer";
import crypto from "crypto";
import path from "path";

const ALLOWED_TYPES = new Map([
  ["image/jpeg", [".jpg", ".jpeg"]],
  ["image/png", [".png"]],
  ["image/webp", [".webp"]],
  ["image/gif", [".gif"]],
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  // random name: no user-controlled filename on disk (prevents path tricks / collisions)
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const exts = ALLOWED_TYPES.get(file.mimetype);
  const ext = path.extname(file.originalname).toLowerCase();
  if (!exts || !exts.includes(ext)) {
    return cb(new Error("INVALID_FILE_TYPE"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }, // 5 MB
});

export default upload;
