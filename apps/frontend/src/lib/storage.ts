import fs from "fs";
import path from "path";
import crypto from "crypto";
import os from "os";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

function getUploadDir(subfolder = "reports"): string {
  const baseDir = process.env.VERCEL ? os.tmpdir() : process.cwd();
  const targetDir = path.resolve(baseDir, "uploads", subfolder);
  try {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
  } catch (err) {
    console.warn(`[Storage] Unable to create local ${subfolder} directory:`, err);
  }
  return targetDir;
}

interface S3Config {
  client: S3Client;
  bucketName: string;
  publicUrl?: string;
}

let cachedS3Config: S3Config | null | undefined = undefined;

function getS3Config(): S3Config | null {
  if (cachedS3Config !== undefined) {
    return cachedS3Config;
  }

  const endpoint =
    process.env.S3_ENDPOINT ||
    (process.env.R2_ACCOUNT_ID
      ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
      : "");
  const accessKeyId =
    process.env.S3_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey =
    process.env.S3_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY;
  const bucketName =
    process.env.S3_BUCKET_NAME || process.env.R2_BUCKET_NAME;
  const region = process.env.S3_REGION || "auto";
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
    cachedS3Config = null;
    return null;
  }

  const client = new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  cachedS3Config = { client, bucketName, publicUrl };
  return cachedS3Config;
}

export class StorageService {
  /**
   * Validate PDF magic bytes (%PDF-)
   */
  public static isValidPdfBuffer(buffer: Buffer): boolean {
    if (!buffer || buffer.length < 5) return false;
    const header = buffer.subarray(0, 10).toString("utf-8");
    return header.startsWith("%PDF-");
  }

  /**
   * Validate Image file format (JPEG, PNG, WebP, GIF)
   */
  public static isValidImageBuffer(buffer: Buffer): boolean {
    if (!buffer || buffer.length < 4) return false;
    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;
    // PNG: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true;
    // GIF: 47 49 46 38
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return true;
    // WebP: RIFF ... WEBP
    if (buffer.length >= 12) {
      const riff = buffer.subarray(0, 4).toString("ascii");
      const webp = buffer.subarray(8, 12).toString("ascii");
      if (riff === "RIFF" && webp === "WEBP") return true;
    }
    return false;
  }

  /**
   * Save uploaded report to private storage (Cloudflare R2 or local fallback)
   */
  public static async saveReport(
    attemptId: string,
    fileBuffer: Buffer,
    originalName: string
  ): Promise<{ fileReference: string; fileName: string; fileSize: number }> {
    if (!this.isValidPdfBuffer(fileBuffer)) {
      throw new Error("Invalid file content. Must be a valid PDF document starting with %PDF- header.");
    }

    const ext = path.extname(originalName) || ".pdf";
    const safeBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const key = `reports/${attemptId}_${safeBase}_${uniqueId}${ext}`;

    const s3 = getS3Config();

    if (s3) {
      try {
        await s3.client.send(
          new PutObjectCommand({
            Bucket: s3.bucketName,
            Key: key,
            Body: fileBuffer,
            ContentType: "application/pdf",
          })
        );
        return {
          fileReference: key,
          fileName: originalName,
          fileSize: fileBuffer.length,
        };
      } catch (err) {
        console.error("[Storage] Failed to upload report to Cloudflare R2, falling back to local:", err);
      }
    }

    // Local filesystem fallback
    const uploadDir = getUploadDir("reports");
    const localFileName = path.basename(key);
    const filePath = path.join(uploadDir, localFileName);
    await fs.promises.writeFile(filePath, fileBuffer);

    return {
      fileReference: localFileName,
      fileName: originalName,
      fileSize: fileBuffer.length,
    };
  }

  /**
   * Retrieve report file buffer from Cloudflare R2 or local fallback
   */
  public static async getReportBuffer(fileReference: string): Promise<Buffer | null> {
    const s3 = getS3Config();

    if (s3) {
      try {
        const key = fileReference.startsWith("reports/") ? fileReference : `reports/${fileReference}`;
        const res = await s3.client.send(
          new GetObjectCommand({
            Bucket: s3.bucketName,
            Key: key,
          })
        );

        if (res.Body) {
          const bytes = await res.Body.transformToByteArray();
          return Buffer.from(bytes);
        }
      } catch (err: any) {
        if (err?.name !== "NoSuchKey" && err?.code !== "NoSuchKey") {
          console.warn("[Storage] R2 getReportBuffer warning:", err);
        }
      }
    }

    // Local filesystem fallback
    const uploadDir = getUploadDir("reports");
    const safeRef = path.basename(fileReference);
    const filePath = path.join(uploadDir, safeRef);
    if (fs.existsSync(filePath)) {
      return fs.promises.readFile(filePath);
    }

    return null;
  }

  /**
   * Save uploaded profile picture / avatar to Cloudflare R2
   */
  public static async saveAvatar(
    userId: string,
    fileBuffer: Buffer,
    mimeType = "image/jpeg",
    originalName = "avatar.jpg"
  ): Promise<{ avatarUrl: string; key: string }> {
    if (!this.isValidImageBuffer(fileBuffer)) {
      throw new Error("Invalid image file format. Supported formats: JPEG, PNG, WebP, GIF.");
    }

    let ext = path.extname(originalName) || ".jpg";
    if (mimeType.includes("png")) ext = ".png";
    if (mimeType.includes("webp")) ext = ".webp";
    if (mimeType.includes("gif")) ext = ".gif";

    const uniqueId = crypto.randomBytes(6).toString("hex");
    const key = `avatars/${userId}_${Date.now()}_${uniqueId}${ext}`;

    const s3 = getS3Config();

    if (s3) {
      await s3.client.send(
        new PutObjectCommand({
          Bucket: s3.bucketName,
          Key: key,
          Body: fileBuffer,
          ContentType: mimeType,
          CacheControl: "public, max-age=31536000, immutable",
        })
      );

      // Return public R2 URL if available, otherwise return proxy route
      const avatarUrl = s3.publicUrl
        ? `${s3.publicUrl}/${key}`
        : `/api/avatar?key=${encodeURIComponent(key)}`;

      return { avatarUrl, key };
    }

    // Local filesystem fallback
    const uploadDir = getUploadDir("avatars");
    const localFileName = path.basename(key);
    const filePath = path.join(uploadDir, localFileName);
    await fs.promises.writeFile(filePath, fileBuffer);

    return {
      avatarUrl: `/api/avatar?key=${encodeURIComponent(localFileName)}`,
      key: localFileName,
    };
  }

  /**
   * Retrieve avatar file buffer and mime type
   */
  public static async getAvatarBuffer(
    avatarKey: string
  ): Promise<{ buffer: Buffer; contentType: string } | null> {
    const s3 = getS3Config();

    if (s3) {
      try {
        const key = avatarKey.startsWith("avatars/") ? avatarKey : `avatars/${avatarKey}`;
        const res = await s3.client.send(
          new GetObjectCommand({
            Bucket: s3.bucketName,
            Key: key,
          })
        );

        if (res.Body) {
          const bytes = await res.Body.transformToByteArray();
          const contentType = res.ContentType || "image/jpeg";
          return { buffer: Buffer.from(bytes), contentType };
        }
      } catch (err: any) {
        if (err?.name !== "NoSuchKey" && err?.code !== "NoSuchKey") {
          console.warn("[Storage] R2 getAvatarBuffer warning:", err);
        }
      }
    }

    // Local filesystem fallback
    const uploadDir = getUploadDir("avatars");
    const safeRef = path.basename(avatarKey);
    const filePath = path.join(uploadDir, safeRef);
    if (fs.existsSync(filePath)) {
      const buffer = await fs.promises.readFile(filePath);
      const ext = path.extname(safeRef).toLowerCase();
      let contentType = "image/jpeg";
      if (ext === ".png") contentType = "image/png";
      if (ext === ".webp") contentType = "image/webp";
      if (ext === ".gif") contentType = "image/gif";
      return { buffer, contentType };
    }

    return null;
  }

  /**
   * Delete an avatar from storage
   */
  public static async deleteAvatar(avatarKeyOrUrl: string): Promise<void> {
    const s3 = getS3Config();
    if (!s3) return;

    try {
      let key = avatarKeyOrUrl;
      if (avatarKeyOrUrl.includes("/avatars/")) {
        key = `avatars/${avatarKeyOrUrl.split("/avatars/")[1]}`;
      } else if (avatarKeyOrUrl.includes("key=")) {
        const urlObj = new URL(avatarKeyOrUrl, "http://localhost");
        key = urlObj.searchParams.get("key") || "";
      }

      if (key && key.startsWith("avatars/")) {
        await s3.client.send(
          new DeleteObjectCommand({
            Bucket: s3.bucketName,
            Key: key,
          })
        );
      }
    } catch (err) {
      console.warn("[Storage] Failed to delete avatar from R2:", err);
    }
  }

  /**
   * Generate short-lived signed download token / URL for reports
   */
  public static generateSignedUrl(fileReference: string, expiresInMinutes: number = 15): string {
    const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
    const secret = process.env.AUTH_SECRET || process.env.JWT_SECRET || "aurapath-storage-signing-secret";
    const dataToSign = `${fileReference}:${expiresAt}`;
    const signature = crypto.createHmac("sha256", secret).update(dataToSign).digest("hex");

    return `/api/reports/download?ref=${encodeURIComponent(fileReference)}&exp=${expiresAt}&sig=${signature}`;
  }

  /**
   * Verify signature on signed download request
   */
  public static verifySignedUrl(fileReference: string, exp: string, sig: string): boolean {
    const expiresAt = parseInt(exp, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return false;
    }
    const secret = process.env.AUTH_SECRET || process.env.JWT_SECRET || "aurapath-storage-signing-secret";
    const expectedSig = crypto.createHmac("sha256", secret).update(`${fileReference}:${expiresAt}`).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
  }
}
