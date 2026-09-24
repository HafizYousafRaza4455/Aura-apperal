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
          colors: p.colors && p.colors.length > 0
            ? p.colors.map((c) => {
                const fallbackProd = PRODUCTS.find((prod) => prod.id === p.id);
                const fallbackColor = fallbackProd?.colors.find((fc) => fc.name === c.name) || fallbackProd?.colors[0];
                const validImg = c.image && typeof c.image === 'string' && c.image.trim() !== ''
                  ? c.image
                  : fallbackColor?.image || 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop';
                const validSecondary = c.secondaryImage && typeof c.secondaryImage === 'string' && c.secondaryImage.trim() !== ''
                  ? c.secondaryImage
                  : fallbackColor?.secondaryImage || validImg;
                return {
                  name: c.name,
                  hex: c.hex || '#0D0D0D',
                  image: validImg,
                  secondaryImage: validSecondary,
                };
              })
            : (PRODUCTS.find((prod) => prod.id === p.id)?.colors || [
                {
                  name: 'Obsidian Black',
                  hex: '#0D0D0D',
                  image: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop',
                  secondaryImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop',
                },
              ]),
          sizes: (() => {
            const variantSizes = Array.from(new Set(p.variants.map((v) => v.size.replace('_', ' ')))).filter(Boolean);
            if (variantSizes.length > 0) return variantSizes;
            const fallbackProd = PRODUCTS.find((prod) => prod.id === p.id);
            return fallbackProd?.sizes && fallbackProd.sizes.length > 0 ? fallbackProd.sizes : ['XS', 'S', 'M', 'L', 'XL'];
          })(),
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
