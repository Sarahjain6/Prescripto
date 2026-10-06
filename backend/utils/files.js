import fs from "fs/promises";

// Multer writes uploads to disk first; remove the temp file once we're done
// (success or failure) so the server's disk doesn't fill up.
export const removeFile = async (file) => {
  if (!file?.path) return;
  try {
    await fs.unlink(file.path);
  } catch {
    /* already gone - ignore */
  }
};
