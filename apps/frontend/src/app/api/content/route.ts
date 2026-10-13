import { NextResponse } from "next/server";
import { getContentBlock, getAllContentBlocks } from "@/lib/content";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key) {
    const block = await getContentBlock(key);
    return NextResponse.json({ success: true, block });
  }

  const blocks = await getAllContentBlocks();
  return NextResponse.json({ success: true, blocks });
}
