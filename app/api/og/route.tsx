import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get('title') || 'Aura Apparel Atelier';
    const subtitle =
      searchParams.get('subtitle') || 'Architectural Minimalism • Milan & New York';
    const price = searchParams.get('price');
    const badge = searchParams.get('badge') || 'PERMANENT ARCHIVE';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: '#0D0D0D',
            padding: '80px 100px',
            fontFamily: 'serif',
            position: 'relative',
          }}
        >
          {/* Subtle gold grid border */}
          <div
            style={{
              position: 'absolute',
              inset: '30px',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              display: 'flex',
            }}
          />

          {/* Top Brand Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: 28,
                  letterSpacing: '0.3em',
                  color: '#FBF9F9',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                AURA APPAREL
              </span>
              <span
                style={{
                  fontSize: 12,
                  letterSpacing: '0.35em',
                  color: '#D4AF37',
                  textTransform: 'uppercase',
                  marginTop: 4,
                  fontFamily: 'sans-serif',
                }}
              >
                Atelier Éditions
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #D4AF37',
                padding: '6px 16px',
                fontSize: 11,
                letterSpacing: '0.25em',
                color: '#D4AF37',
                textTransform: 'uppercase',
                fontFamily: 'sans-serif',
              }}
            >
              {badge}
            </div>
          </div>

          {/* Middle: Editorial Title */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              zIndex: 10,
              maxWidth: 900,
            }}
          >
            <h1
              style={{
                fontSize: 64,
                color: '#FBF9F9',
                margin: 0,
                lineHeight: 1.15,
                fontWeight: 400,
                letterSpacing: '0.04em',
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: 22,
                color: '#A3A3A3',
                marginTop: 20,
                marginBottom: 0,
                fontFamily: 'sans-serif',
                fontWeight: 300,
                letterSpacing: '0.05em',
              }}
            >
              {subtitle}
            </p>
          </div>

          {/* Bottom Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              width: '100%',
              zIndex: 10,
              fontFamily: 'sans-serif',
            }}
          >
            <span
              style={{
                fontSize: 12,
                letterSpacing: '0.25em',
                color: '#707070',
                textTransform: 'uppercase',
              }}
            >
              MILAN • TOKYO • NEW YORK • ARCHITECTURAL LUXURY
            </span>

            {price && (
              <span
                style={{
                  fontSize: 32,
                  color: '#D4AF37',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                }}
              >
                ${price}
              </span>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate OpenGraph image: ${e.message}`, {
      status: 500,
    });
  }
}
