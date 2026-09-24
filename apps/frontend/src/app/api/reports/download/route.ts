import { NextRequest, NextResponse } from "next/server";
import { StorageService } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ref = searchParams.get("ref");
  const exp = searchParams.get("exp");
  const sig = searchParams.get("sig");

  if (!ref || !exp || !sig) {
    return NextResponse.json({ error: "Missing signed URL parameters." }, { status: 400 });
  }

  const isValid = StorageService.verifySignedUrl(ref, exp, sig);
  if (!isValid) {
    return NextResponse.json({ error: "Signed download link is invalid or has expired." }, { status: 403 });
  }

  const fileBuffer = await StorageService.getReportBuffer(ref);
  if (!fileBuffer) {
    return NextResponse.json({ error: "Report file not found." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(fileBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${ref}"`,
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    },
  });
}
