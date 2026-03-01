import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const list = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { labelEn, labelVi, labelZh, labelFr, descriptionEn, descriptionVi, descriptionZh, descriptionFr, imageUrl, icon, sortOrder } = body;
    if (!labelEn || !labelVi || !labelZh || !labelFr) {
      return NextResponse.json(
        { error: 'Vui lòng nhập đầy đủ nhãn 4 ngôn ngữ' },
        { status: 400 }
      );
    }
    const created = await prisma.category.create({
      data: {
        labelEn: String(labelEn),
        labelVi: String(labelVi),
        labelZh: String(labelZh),
        labelFr: String(labelFr),
        descriptionEn: descriptionEn != null ? String(descriptionEn) : null,
        descriptionVi: descriptionVi != null ? String(descriptionVi) : null,
        descriptionZh: descriptionZh != null ? String(descriptionZh) : null,
        descriptionFr: descriptionFr != null ? String(descriptionFr) : null,
        imageUrl: imageUrl != null ? String(imageUrl) : null,
        icon: icon ? String(icon) : null,
        sortOrder: Number(sortOrder) || 0,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
