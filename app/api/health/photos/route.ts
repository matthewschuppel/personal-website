import { NextResponse } from "next/server";
import { saveProgressPhoto } from "@/lib/health-db";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A progress photo file is required." }, { status: 400 });
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Progress photos must be 8 MB or smaller." }, { status: 400 });
  }

  const photo = await saveProgressPhoto(file, {
    date: String(form.get("date") ?? new Date().toISOString().slice(0, 10)),
    angle: String(form.get("angle") ?? "Front") as "Front",
    weight: Number(form.get("weight") ?? 0),
    notes: String(form.get("notes") ?? "")
  });

  return NextResponse.json({ photo }, { status: 201 });
}
