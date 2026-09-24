import fs from "fs";
import path from "path";
import crypto from "crypto";
import os from "os";

function getUploadDir(): string {
  const baseDir = process.env.VERCEL ? os.tmpdir() : process.cwd();
  const targetDir = path.resolve(baseDir, "uploads", "reports");
  try {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
  } catch (err) {
    console.warn("[Storage] Unable to create upload directory:", err);
  }
  return targetDir;
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
   * Save uploaded report to private storage
   */
  public static async saveReport(
    attemptId: string,
    fileBuffer: Buffer,
    originalName: string
  ): Promise<{ fileReference: string; fileName: string; fileSize: number }> {
    if (!this.isValidPdfBuffer(fileBuffer)) {
      throw new Error("Invalid file content. Must be a valid PDF document starting with %PDF- header.");
    }

    const uploadDir = getUploadDir();
    const ext = path.extname(originalName) || ".pdf";
    const safeBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const fileName = `${attemptId}_${safeBase}_${uniqueId}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.promises.writeFile(filePath, fileBuffer);

    return {
      fileReference: fileName,
      fileName: originalName,
      fileSize: fileBuffer.length,
    };
  }

  /**
   * Retrieve file buffer
   */
  public static async getReportBuffer(fileReference: string): Promise<Buffer | null> {
    const uploadDir = getUploadDir();
    const safeRef = path.basename(fileReference);
    const filePath = path.join(uploadDir, safeRef);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return fs.promises.readFile(filePath);
  }

  /**
   * Generate short-lived signed download token / URL
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
