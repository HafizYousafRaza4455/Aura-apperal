import { NextResponse } from 'next/server';
import { PRODUCTS } from '../../../src/data/products';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const sort = searchParams.get('sort');

  try {
    const { prisma } = await import('../../../lib/prisma');
    const whereClause: any = {};
    if (category && category !== 'all') {
      const dbCat = category.toUpperCase().replace('-', '_');
      whereClause.category = dbCat;
    }

    let orderByClause: any = { createdAt: 'desc' };
    if (sort === 'price-asc') orderByClause = { price: 'asc' };
    if (sort === 'price-desc') orderByClause = { price: 'desc' };

    const dbProducts = await prisma.product.findMany({
      where: whereClause,
      include: {
        colors: true,
        variants: {
          include: { inventory: true },
        },
      },
      orderBy: orderByClause,
    });

    if (dbProducts.length > 0) {
      const formatted = dbProducts.map((p) => ({
        id: p.id,
        title: p.title,
        subtitle: p.subtitle,
        price: p.price,
        category: p.category.toLowerCase().replace('_', '-'),
        badge: p.badge?.replace('_', ' '),
        description: p.description,
        details: p.details,
        featured: p.featured,
        stock: p.variants.reduce((acc, v) => acc + (v.inventory?.stock ?? 0), 0),
        colors: p.colors,
        sizes: Array.from(new Set(p.variants.map((v) => v.size))),
      }));
      return NextResponse.json({ products: formatted });
    }
  } catch (e) {
    // fallback to static products
  }

  let filtered = [...PRODUCTS];
  if (category && category !== 'all') {
    filtered = filtered.filter((p) => p.category === category);
  }
  if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);

  return NextResponse.json({ products: filtered });
}
