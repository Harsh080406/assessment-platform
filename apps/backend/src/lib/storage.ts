import fs from "fs";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads", "reports");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export class StorageService {
  /**
   * Validate PDF magic bytes (%PDF- => 0x25 0x50 0x44 0x46 0x2D)
   */
  public static isValidPdfBuffer(buffer: Buffer): boolean {
    if (!buffer || buffer.length < 5) return false;
    const header = buffer.subarray(0, 10).toString("utf-8");
    return header.startsWith("%PDF-");
  }

  /**
   * Save uploaded report buffer to private storage
   */
  public static async saveReport(
    attemptId: string,
    fileBuffer: Buffer,
    originalName: string
  ): Promise<{ fileReference: string; fileName: string; fileSize: number }> {
    if (!this.isValidPdfBuffer(fileBuffer)) {
      throw new Error("Invalid file content. File must be a valid PDF document with %PDF- header.");
    }

    const ext = path.extname(originalName) || ".pdf";
    const safeBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const fileName = `${attemptId}_${safeBase}_${uniqueId}${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    await fs.promises.writeFile(filePath, fileBuffer);

    return {
      fileReference: fileName,
      fileName: originalName,
      fileSize: fileBuffer.length,
    };
  }

  /**
   * Retrieve file buffer by fileReference
   */
  public static async getReportBuffer(fileReference: string): Promise<Buffer | null> {
    const safeRef = path.basename(fileReference);
    const filePath = path.join(UPLOAD_DIR, safeRef);
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
    const secret = process.env.JWT_SECRET || "aurapath-storage-signing-secret";
    const dataToSign = `${fileReference}:${expiresAt}`;
    const signature = crypto.createHmac("sha256", secret).update(dataToSign).digest("hex");

    return `/api/v1/reports/download?ref=${encodeURIComponent(fileReference)}&exp=${expiresAt}&sig=${signature}`;
  }

  /**
   * Verify signature on signed download request
   */
  public static verifySignedUrl(fileReference: string, exp: string, sig: string): boolean {
    const expiresAt = parseInt(exp, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return false;
    }
    const secret = process.env.JWT_SECRET || "aurapath-storage-signing-secret";
    const expectedSig = crypto.createHmac("sha256", secret).update(`${fileReference}:${expiresAt}`).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
  }
}
