import { NextRequest, NextResponse } from 'next/server';
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
  const item = await prisma.category.findUnique({ where: { id } });
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
    const { labelEn, labelVi, labelZh, labelFr, descriptionEn, descriptionVi, descriptionZh, descriptionFr, imageUrl, icon, sortOrder } = body;
    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(labelEn != null && { labelEn: String(labelEn) }),
        ...(labelVi != null && { labelVi: String(labelVi) }),
        ...(labelZh != null && { labelZh: String(labelZh) }),
        ...(labelFr != null && { labelFr: String(labelFr) }),
        ...(descriptionEn !== undefined && { descriptionEn: descriptionEn != null ? String(descriptionEn) : null }),
        ...(descriptionVi !== undefined && { descriptionVi: descriptionVi != null ? String(descriptionVi) : null }),
        ...(descriptionZh !== undefined && { descriptionZh: descriptionZh != null ? String(descriptionZh) : null }),
        ...(descriptionFr !== undefined && { descriptionFr: descriptionFr != null ? String(descriptionFr) : null }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl != null ? String(imageUrl) : null }),
        ...(icon !== undefined && { icon: icon ? String(icon) : null }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) || 0 }),
      },
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
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
