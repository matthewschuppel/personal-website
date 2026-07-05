import { NextResponse } from "next/server";
import { createBookmark, listBookmarks } from "@/lib/dashboard-db";

export async function GET() {
  const bookmarks = await listBookmarks();
  return NextResponse.json({ bookmarks });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const bookmark = await createBookmark(body);
  return NextResponse.json({ bookmark }, { status: 201 });
}
