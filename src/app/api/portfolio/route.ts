import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const filePath = path.join(process.cwd(), 'public' ,'data', 'portfolio.json');

function readData(): Array<{ id: string; category: string; title: string; description: string; year: string }> {
  const fileData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileData);
}

function writeData(data: Array<{ id: string; category: string; title: string; description: string; year: string }>) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(req: NextRequest) {
  const data = readData();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { category, title, description, year } = body;

  if (!category || !title || !description || !year) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const data = readData();
  const newItem = {
    id: crypto.randomUUID(),
    category,
    title,
    description,
    year,
  };
  data.push(newItem);
  writeData(data);

  return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const body = await req.json();
  const { category, title, description, year } = body;

  if (!category || !title || !description || !year) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const data = readData();
  const index = data.findIndex((item) => item.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  data[index] = { id, category, title, description, year };
  writeData(data);

  return NextResponse.json(data[index]);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const data = readData();
  const filteredData = data.filter((item) => item.id !== id);
  if (filteredData.length === data.length) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  writeData(filteredData);
  return NextResponse.json({ success: true });
}