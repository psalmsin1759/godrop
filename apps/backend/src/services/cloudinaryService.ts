import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadBuffer(buffer: Buffer, folder: string, resourceType: "image" | "raw" | "auto" = "image"): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error("Upload failed"));
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

// Upload a compliance document (image or PDF)
export async function uploadDocument(buffer: Buffer, folder: string): Promise<string> {
  return uploadBuffer(buffer, folder, "auto");
}

// Delete a Cloudinary image by its secure URL — never throws, logs errors
export async function deleteImageByUrl(url: string): Promise<void> {
  try {
    // Extract public_id from URL: everything after /upload/(v\d+/)? up to (but not including) the extension
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w{2,5})?$/);
    if (!match?.[1]) return;
    await cloudinary.uploader.destroy(match[1]);
  } catch (err) {
    console.error("[cloudinary] Failed to delete image:", err);
  }
}
