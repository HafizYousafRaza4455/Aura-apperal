import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://aura-apparel.vercel.app'),
  title: 'Aura Apparel — Luxury Minimalist Storefront',
  description:
    'Aura Apparel — Luxury Minimalist Clothing. Structural refinement, architectural tailoring, and rare textiles.',
  keywords: ['luxury', 'fashion', 'minimalist', 'outerwear', 'cashmere', 'high fashion'],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230D0D0D'><text y='18' font-size='18' font-family='serif'>A</text></svg>",
  },
  openGraph: {
    title: 'Aura Apparel — Luxury Minimalist Storefront',
    description: 'Structural refinement, architectural tailoring, and rare textiles.',
    url: '/',
    siteName: 'Aura Apparel',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Aura Apparel — Luxury Minimalist Fashion',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aura Apparel — Luxury Minimalist Storefront',
    description: 'Structural refinement, architectural tailoring, and rare textiles.',
    images: ['/api/og'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-[#FBF9F9] text-[#0D0D0D] font-sans antialiased selection:bg-[#0D0D0D] selection:text-[#FBF9F9]">
        {children}
      </body>
    </html>
  );
}
