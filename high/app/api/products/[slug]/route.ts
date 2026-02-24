import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slugify';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const categoryIdParam = searchParams.get('categoryId');

    let categoryId: number | undefined;
    if (categoryIdParam) {
      const n = parseInt(categoryIdParam, 10);
      if (!Number.isNaN(n)) categoryId = n;
    }
    if (categoryId == null && type) {
      const categories = await prisma.category.findMany({
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      });
      const slugLower = type.trim().toLowerCase();
      const found = categories.find(
        (c) => slugify(c.labelEn) === slugLower
      );
      if (found) categoryId = found.id;
    }

    if (categoryId == null) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const product = await prisma.product.findFirst({
      where: { slug, categoryId },
      include: { category: true },
    });
    if (!product) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
