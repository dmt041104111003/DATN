import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const categoryIdParam = searchParams.get('categoryId');
  const search = searchParams.get('search')?.trim() ?? '';

  const categoryId = categoryIdParam ? parseInt(categoryIdParam, 10) : undefined;
  const hasCategory = typeof categoryId === 'number' && !Number.isNaN(categoryId);
  const searchNum = search ? parseInt(search, 10) : NaN;
  const isSearchNumeric = !Number.isNaN(searchNum);

  const where: {
    categoryId?: number;
    OR?: Array<
      | { id: number }
      | { nameEn: { contains: string; mode: 'insensitive' } }
      | { nameVi: { contains: string; mode: 'insensitive' } }
      | { nameZh: { contains: string; mode: 'insensitive' } }
      | { nameFr: { contains: string; mode: 'insensitive' } }
    >;
  } = {};
  if (hasCategory) where.categoryId = categoryId;
  if (search) {
    const orConditions: NonNullable<typeof where.OR> = [];
    if (isSearchNumeric) orConditions.push({ id: searchNum });
    orConditions.push(
      { nameEn: { contains: search, mode: 'insensitive' } },
      { nameVi: { contains: search, mode: 'insensitive' } },
      { nameZh: { contains: search, mode: 'insensitive' } },
      { nameFr: { contains: search, mode: 'insensitive' } }
    );
    where.OR = orConditions;
  }

  const list = await prisma.product.findMany({
    where: Object.keys(where).length ? where : undefined,
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    include: { category: true },
  });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const {
      categoryId,
      slug,
      nameEn,
      nameVi,
      nameZh,
      nameFr,
      descriptionEn,
      descriptionVi,
      descriptionZh,
      descriptionFr,
      imageUrl,
      youtubeUrl,
      sortOrder,
    } = body;
    if (!slug || !nameEn || !nameVi || !nameZh || !nameFr || categoryId == null) {
      return NextResponse.json(
        { error: 'Vui lòng nhập đầy đủ: slug, tên 4 ngôn ngữ, loại' },
        { status: 400 }
      );
    }
    const created = await prisma.product.create({
      data: {
        categoryId: Number(categoryId),
        slug: String(slug).trim(),
        nameEn: String(nameEn),
        nameVi: String(nameVi),
        nameZh: String(nameZh),
        nameFr: String(nameFr),
        descriptionEn: descriptionEn ? String(descriptionEn) : null,
        descriptionVi: descriptionVi ? String(descriptionVi) : null,
        descriptionZh: descriptionZh ? String(descriptionZh) : null,
        descriptionFr: descriptionFr ? String(descriptionFr) : null,
        imageUrl: imageUrl ? String(imageUrl) : null,
        youtubeUrl: youtubeUrl ? String(youtubeUrl) : null,
        sortOrder: Number(sortOrder) || 0,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
