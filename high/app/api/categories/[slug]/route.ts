import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slugify';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const slug = (await params).slug?.trim();
  if (!slug) {
    return NextResponse.json({ error: 'Slug required' }, { status: 400 });
  }
  const list = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  const category = list.find((c) => slugify(c.labelEn) === slug);
  if (!category) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const c = category as typeof category & {
    descriptionEn?: string | null;
    descriptionVi?: string | null;
    descriptionZh?: string | null;
    descriptionFr?: string | null;
    imageUrl?: string | null;
  };
  return NextResponse.json({
    id: c.id,
    labelEn: c.labelEn,
    labelVi: c.labelVi,
    labelZh: c.labelZh,
    labelFr: c.labelFr,
    descriptionEn: c.descriptionEn ?? null,
    descriptionVi: c.descriptionVi ?? null,
    descriptionZh: c.descriptionZh ?? null,
    descriptionFr: c.descriptionFr ?? null,
    imageUrl: c.imageUrl ?? null,
    icon: c.icon,
    sortOrder: c.sortOrder,
  });
}
