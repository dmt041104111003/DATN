import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_PAGE_SIZE = 12;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryIdParam = searchParams.get('categoryId');
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE));

    const categoryId = categoryIdParam ? parseInt(categoryIdParam, 10) : undefined;
    const hasValidCategory =
      typeof categoryId === 'number' && !Number.isNaN(categoryId);

    if (!hasValidCategory) {
      return NextResponse.json({ items: [], total: 0 });
    }

    const search = searchParams.get('search')?.trim() ?? '';
    const searchNum = search ? parseInt(search, 10) : NaN;
    const isSearchNumeric = !Number.isNaN(searchNum);

    const where: { categoryId: number; OR?: Array<{ id?: number; nameEn?: { contains: string; mode: 'insensitive' }; nameVi?: { contains: string; mode: 'insensitive' }; nameZh?: { contains: string; mode: 'insensitive' }; nameFr?: { contains: string; mode: 'insensitive' } }> } = {
      categoryId,
    };
    if (search) {
      const orConditions: typeof where.OR = [];
      if (isSearchNumeric) orConditions.push({ id: searchNum });
      if (search.length > 0) {
        const term = search;
        orConditions.push(
          { nameEn: { contains: term, mode: 'insensitive' } },
          { nameVi: { contains: term, mode: 'insensitive' } },
          { nameZh: { contains: term, mode: 'insensitive' } },
          { nameFr: { contains: term, mode: 'insensitive' } }
        );
      }
      where.OR = orConditions;
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({ items, total });
  } catch (e) {
    return NextResponse.json({ items: [], total: 0 });
  }
}
