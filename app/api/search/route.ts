import { NextRequest, NextResponse } from 'next/server';
import { searchCatalog } from '@/../lib/search';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const query = searchParams.get('q') || searchParams.get('query') || undefined;
    const category = searchParams.get('category') || undefined;
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const inStockOnly = searchParams.get('inStockOnly') === 'true';
    const sort = (searchParams.get('sort') as any) || 'featured';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;

    const results = await searchCatalog({
      query,
      category,
      minPrice,
      maxPrice,
      inStockOnly,
      sort,
      limit,
    });

    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (err: any) {
    console.error('Search endpoint failure:', err);
    return NextResponse.json(
      { error: 'Failed to execute catalog search', message: err.message },
      { status: 500 }
    );
  }
}
