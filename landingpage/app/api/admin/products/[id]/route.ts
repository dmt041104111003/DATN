import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = Number((await params).id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }
  const item = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!item) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = Number((await params).id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.categoryId != null) data.categoryId = Number(body.categoryId);
    if (body.slug != null) data.slug = String(body.slug).trim();
    if (body.nameEn != null) data.nameEn = String(body.nameEn);
    if (body.nameVi != null) data.nameVi = String(body.nameVi);
    if (body.nameZh != null) data.nameZh = String(body.nameZh);
    if (body.nameFr != null) data.nameFr = String(body.nameFr);
    if (body.descriptionEn !== undefined) data.descriptionEn = body.descriptionEn ? String(body.descriptionEn) : null;
    if (body.descriptionVi !== undefined) data.descriptionVi = body.descriptionVi ? String(body.descriptionVi) : null;
    if (body.descriptionZh !== undefined) data.descriptionZh = body.descriptionZh ? String(body.descriptionZh) : null;
    if (body.descriptionFr !== undefined) data.descriptionFr = body.descriptionFr ? String(body.descriptionFr) : null;
    if (body.descriptionBlocks !== undefined) {
      data.descriptionBlocks = Array.isArray(body.descriptionBlocks) && body.descriptionBlocks.length > 0
        ? (body.descriptionBlocks as Array<{ titleEn?: string; titleVi?: string; titleZh?: string; titleFr?: string; textEn?: string; textVi?: string; textZh?: string; textFr?: string; imageUrl?: string | null; youtubeUrl?: string | null }>).map((b) => ({
            titleEn: b.titleEn ?? '',
            titleVi: b.titleVi ?? '',
            titleZh: b.titleZh ?? '',
            titleFr: b.titleFr ?? '',
            textEn: b.textEn ?? '',
            textVi: b.textVi ?? '',
            textZh: b.textZh ?? '',
            textFr: b.textFr ?? '',
            imageUrl: b.imageUrl ?? null,
            youtubeUrl: b.youtubeUrl ?? null,
          }))
        : Prisma.DbNull;
    }
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl ? String(body.imageUrl) : null;
    if (body.youtubeUrl !== undefined) data.youtubeUrl = body.youtubeUrl ? String(body.youtubeUrl) : null;
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder) || 0;

    const updated = await prisma.product.update({
      where: { id },
      data: data as Parameters<typeof prisma.product.update>[0]['data'],
    });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = Number((await params).id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
