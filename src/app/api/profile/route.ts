import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "public", "data", "profile.json");

function readData() {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writeData(data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  return NextResponse.json(readData());
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { name, bio, avatar, socials } = body;
  if (!name || !bio || !avatar || !Array.isArray(socials)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  writeData({ name, bio, avatar, socials });
  return NextResponse.json({ success: true });
}