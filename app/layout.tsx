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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400;1,6..96,500&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Hanken+Grotesk:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="bg-[#FBF9F9] text-[#0D0D0D] font-sans antialiased selection:bg-[#0D0D0D] selection:text-[#FBF9F9]">
        {children}
      </body>
    </html>
  );
}
