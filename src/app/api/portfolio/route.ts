import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const filePath = path.join(process.cwd(), 'public','data', 'portfolio.json');

function readData(): Record<string, { generalInfo: string; projects: Array<{ id: string; title: string; description: string; year: string }> }> {
  const fileData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileData);
}

function writeData(data: Record<string, { generalInfo: string; projects: Array<{ id: string; title: string; description: string; year: string }> }>) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(req: NextRequest) {
  const data = readData();
  Object.keys(data).forEach((cat) => {
    data[cat].projects.sort((a, b) => parseInt(b.year) - parseInt(a.year));
  });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { category, title, description, year } = body;

  if (!category || !title || !description || !year) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const data = readData();
  if (!data[category]) {
    data[category] = { generalInfo: '', projects: [] };
  }
  const newItem = {
    id: crypto.randomUUID(),
    title,
    description,
    year,
  };
  data[category].projects.push(newItem);
  writeData(data);

  return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  const type = req.nextUrl.searchParams.get('type'); 

  const body = await req.json();
  const data = readData();

  if (type === 'generalInfo') {
    const { category, generalInfo } = body;
    if (!category || generalInfo === undefined) {
      return NextResponse.json({ error: 'Missing category or generalInfo' }, { status: 400 });
    }
    if (!data[category]) {
      data[category] = { generalInfo, projects: [] };
    } else {
      data[category].generalInfo = generalInfo;
    }
    writeData(data);
    return NextResponse.json({ success: true });
  } else {
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    const { category, title, description, year } = body;
    if (!category || !title || !description || !year) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    if (!data[category]) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    const index = data[category].projects.findIndex((item) => item.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    data[category].projects[index] = { id, title, description, year };
    writeData(data);
    return NextResponse.json(data[category].projects[index]);
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  const category = req.nextUrl.searchParams.get('category');
  if (!category) {
    return NextResponse.json({ error: 'Missing category' }, { status: 400 });
  }

  const data = readData();
  if (!data[category]) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  if (id) {
    data[category].projects = data[category].projects.filter((item) => item.id !== id);
  } else {
    delete data[category];
  }

  writeData(data);
  return NextResponse.json({ success: true });
}