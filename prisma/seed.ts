import { PrismaClient, Category, ProductBadge, ProductSize } from '@prisma/client';
import { PRODUCTS } from '../src/data/products';

const prisma = new PrismaClient();

const mapCategory = (cat: string): Category => {
  switch (cat) {
    case 'outerwear':
      return Category.OUTERWEAR;
    case 'essentials':
      return Category.ESSENTIALS;
    case 'summer-drop':
      return Category.SUMMER_DROP;
    default:
      return Category.ESSENTIALS;
  }
};

const mapBadge = (badge?: string): ProductBadge | null => {
  if (!badge) return null;
  switch (badge) {
    case 'EXCLUSIVE':
      return ProductBadge.EXCLUSIVE;
    case 'NEW ARRIVAL':
      return ProductBadge.NEW_ARRIVAL;
    case 'BESTSELLER':
      return ProductBadge.BESTSELLER;
    case 'SUMMER DROP':
      return ProductBadge.SUMMER_DROP;
    default:
      return null;
  }
};

const mapSize = (size: string): ProductSize => {
  switch (size.toUpperCase()) {
    case 'XS':
      return ProductSize.XS;
    case 'S':
      return ProductSize.S;
    case 'M':
      return ProductSize.M;
    case 'L':
      return ProductSize.L;
    case 'XL':
      return ProductSize.XL;
    case 'ONE SIZE':
    case 'ONESIZE':
      return ProductSize.ONE_SIZE;
    default:
      return ProductSize.M;
  }
};

async function main() {
  console.log('Seeding Aura Apparel luxury catalog into PostgreSQL...');

  // Optional: Clean existing records for idempotent runs
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.stockReservation.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productColor.deleteMany({});
  await prisma.product.deleteMany({});

  for (const p of PRODUCTS) {
    const product = await prisma.product.create({
      data: {
        id: p.id,
        slug: p.id,
        title: p.title,
        subtitle: p.subtitle,
        price: p.price,
        category: mapCategory(p.category),
        badge: mapBadge(p.badge),
        description: p.description,
        details: p.details || [],
        featured: Boolean(p.featured),
      },
    });

    for (const c of p.colors) {
      const color = await prisma.productColor.create({
        data: {
          productId: product.id,
          name: c.name,
          hex: c.hex,
          image: c.image,
          secondaryImage: c.secondaryImage || null,
        },
      });

      // Create variants for every size
      for (const s of p.sizes) {
        const sizeEnum = mapSize(s);
        const sku = `${product.id}-${c.name.replace(/\s+/g, '').toUpperCase().slice(0, 3)}-${sizeEnum}`;

        const variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            colorId: color.id,
            size: sizeEnum,
            sku,
          },
        });

        // Seed stock inventory per variant
        const variantStock = Math.max(2, Math.floor((p.stock || 10) / p.sizes.length));
        await prisma.inventory.create({
          data: {
            variantId: variant.id,
            stock: variantStock,
            reserved: 0,
            warehouse: 'MILAN_ATELIER',
          },
        });
      }
    }
    console.log(`✓ Seeded product: ${product.title} (${product.id})`);
  }

  console.log('Seeding complete! All products and variants are live in PostgreSQL.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
