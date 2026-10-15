import { NextRequest, NextResponse } from "next/server";
import { StorageService } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Missing avatar key parameter." }, { status: 400 });
  }

  const result = await StorageService.getAvatarBuffer(key);
  if (!result) {
    return NextResponse.json({ error: "Avatar image not found." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(result.buffer), {
    headers: {
      "Content-Type": result.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
