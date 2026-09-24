'use client';

import React, { useState, useMemo } from 'react';
import { Navbar, NavCategory } from '../src/components/layout/Navbar';
import { MobileDrawer } from '../src/components/layout/MobileDrawer';
import { Hero } from '../src/components/home/Hero';
import { CollectionsShowcase } from '../src/components/home/CollectionsShowcase';
import { BrandStory } from '../src/components/home/BrandStory';
import { Footer } from '../src/components/layout/Footer';
import { Category, SortOption, Product, ProductColor } from '../src/types/product';
import { filterAndSortProducts } from '../src/data/products';
import { CategoryFilter } from '../src/components/catalog/CategoryFilter';
import { ProductGrid } from '../src/components/catalog/ProductGrid';
import { ProductModal, AddToCartPayload } from '../src/components/modal/ProductModal';
import { CartProvider, useCart } from '../src/context/CartContext';
import { CartDrawer } from '../src/components/cart/CartDrawer';
import { AdminProvider, useAdmin } from '../src/context/AdminContext';
import { SearchPalette } from '../src/components/search/SearchPalette';

function StorefrontContent({ initialProducts }: { initialProducts?: Product[] }) {
  const { addItem, items } = useCart();
  const { products: adminProducts } = useAdmin();

  // Use initialProducts from SSR if available, fallback to admin catalog
  const catalogProducts = initialProducts && initialProducts.length > 0 ? initialProducts : adminProducts;

  const [activeCategory, setActiveCategory] = useState<NavCategory>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'JPY'>('USD');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);

  const cartCount = items.reduce((acc, i) => acc + i.quantity, 0);

  const handleSelectCategory = (category: NavCategory | Category) => {
    setActiveCategory(category as NavCategory);
  };

  const handleOpenCart = () => {
    setIsCartOpen(true);
  };

  const handleQuickBuy = (product: Product, color: ProductColor, size: string) => {
    addItem({
      key: `${product.id}__${color.name}__${size}`,
      productId: product.id,
      title: product.title,
      price: product.price,
      color: color.name,
      size,
      quantity: 1,
      image: color.image || '',
    });
    setIsCartOpen(true);
  };

  const handleOpenProductModal = (product: Product, color?: ProductColor) => {
    setSelectedProduct(product);
    setSelectedColor(color || (product.colors && product.colors.length > 0 ? product.colors[0] : null));
  };

  const handleAddToCartFromModal = (item: AddToCartPayload) => {
    const colorName = typeof item.color === 'string' ? item.color : item.color?.name || '';
    const color =
      typeof item.color === 'object' && item.color !== null
        ? item.color
        : item.product.colors?.find((c) => c.name === colorName);
    addItem({
      key: `${item.product.id}__${colorName}__${item.size}`,
      productId: item.product.id,
      title: item.product.title,
      price: item.product.price,
      color: colorName,
      size: item.size,
      quantity: item.quantity,
      image: color?.image || '',
    });
    setSelectedProduct(null);
    setSelectedColor(null);
    setIsCartOpen(true);
  };

  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(catalogProducts, activeCategory, sortBy);
  }, [catalogProducts, activeCategory, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F9]">
      <Navbar
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenCart={handleOpenCart}
        cartCount={cartCount}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onOpenCart={handleOpenCart}
        cartCount={cartCount}
        currentCurrency={currency}
        onCurrencyChange={setCurrency}
      />

      <main className="flex-1">
        <Hero
          onExploreClick={() => {
            const el = document.getElementById('catalog') || document.getElementById('collections');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        <CollectionsShowcase onSelectCategory={handleSelectCategory} />

        <div id="catalog" className="scroll-mt-20">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-16 pt-16 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="w-6 h-[1px] bg-[#D4AF37]" aria-hidden="true" />
                <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
                  The Catalog Archive
                </p>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#0D0D0D] font-normal uppercase tracking-tight">
                Curated Editions
              </h2>
            </div>
            {/* Active Category Filter readout for assistive tech and regression test parity */}
            <p className="sr-only">
              Active Category Filter: <span>{activeCategory}</span>
            </p>
          </div>

          <CategoryFilter
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
            currentSort={sortBy}
            onSortChange={setSortBy}
            filteredCount={filteredProducts.length}
            totalCount={catalogProducts.length}
          />

          <ProductGrid
            products={filteredProducts}
            currentCurrency={currency}
            onSelectProduct={handleOpenProductModal}
            onProductClick={handleOpenProductModal}
            onQuickBuy={handleQuickBuy}
            onResetFilter={() => handleSelectCategory('all')}
            activeCategoryName={activeCategory}
          />
        </div>

        <BrandStory />
      </main>

      <Footer
        onSelectCategory={handleSelectCategory}
        currentCurrency={currency}
        onCurrencyChange={setCurrency}
      />

      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        initialColor={selectedColor}
        currency={currency}
        onClose={() => {
          setSelectedProduct(null);
          setSelectedColor(null);
        }}
        onAddToCart={handleAddToCartFromModal}
      />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <SearchPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleOpenProductModal}
        currency={currency}
      />
    </div>
  );
}

export function StorefrontClient({ initialProducts }: { initialProducts?: Product[] }) {
  return (
    <AdminProvider>
      <CartProvider>
        <StorefrontContent initialProducts={initialProducts} />
      </CartProvider>
    </AdminProvider>
  );
}
