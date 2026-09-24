import { StorefrontClient } from '../components/StorefrontClient';
import { PRODUCTS } from '../src/data/products';
import { Product } from '../src/types/product';

async function getProducts(): Promise<Product[]> {
  try {
    // Dynamic import to prevent build-time crashes if Prisma client is not yet generated
    const { prisma } = await import('../lib/prisma');
    const dbProducts = await prisma.product.findMany({
      include: {
        colors: true,
        variants: {
          include: {
            inventory: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (dbProducts && dbProducts.length > 0) {
      return dbProducts.map((p) => {
        const totalStock = p.variants.reduce((sum, v) => sum + (v.inventory?.stock ?? 0), 0);
        return {
          id: p.id,
          title: p.title,
          subtitle: p.subtitle,
          price: p.price,
          category: p.category.toLowerCase().replace('_', '-') as any,
          badge: p.badge ? (p.badge.replace('_', ' ') as any) : undefined,
          description: p.description,
          details: p.details,
          featured: p.featured,
          stock: totalStock,
          colors: p.colors.map((c) => ({
            name: c.name,
            hex: c.hex,
            image: c.image,
            secondaryImage: c.secondaryImage || c.image,
          })),
          sizes: Array.from(new Set(p.variants.map((v) => v.size.replace('_', ' ')))),
        };
      });
    }
  } catch (err) {
    // Graceful fallback to static product catalog for offline/seed-pending dev mode
    console.warn('Prisma query skipped, using high-fidelity static catalog:', err);
  }

  return PRODUCTS;
}

export default async function HomePage() {
  const products = await getProducts();

  return <StorefrontClient initialProducts={products} />;
}
