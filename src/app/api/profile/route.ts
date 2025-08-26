import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "public", "data", "profile.json");

interface LanguageItem {
  lang: string;
  reading: number;
  writing: number;
  speaking: number;
  listening: number;
  skills: string;
}

interface ProgrammingItem {
  lang:string;
  level: number;
  skills: string;
}

function readData() {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading profile data:", error);
    return {
      name: "",
      bioshort: "",
      bio: "",
      avatar: "",
      socials: [],
      languages: {},
      programming: {},
    };
  }
}

function writeData(data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  return NextResponse.json(readData());
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, bioshort, bio, avatar, socials, languages, programming } =
      body;
    if (!name || !bioshort) {
      return NextResponse.json({ error: "Name and short bio are required" }, { status: 400 });
    }

    if (!Array.isArray(socials) || !Array.isArray(languages) || !Array.isArray(programming)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const currentData = readData();

    const languagesObject = languages.reduce(
      (acc: Record<string, any>, item: LanguageItem) => {
        acc[item.lang] = {
          reading: item.reading,
          writing: item.writing,
          speaking: item.speaking,
          listening: item.listening,
        };
        return acc;
      },
      {}
    );

    const programmingObject = programming.reduce(
      (acc: Record<string, any>, item: ProgrammingItem) => {
        acc[item.lang] = { level: item.level, skill: item.skills };
        return acc;
      },
      {}
    );

    const newData = {
      ...currentData,
      name,
      bioshort,
      bio: bio || "", // allow empty bio
      avatar: avatar || "",
      socials,
      languages: languagesObject,
      programming: programmingObject,
    };

    writeData(newData);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}