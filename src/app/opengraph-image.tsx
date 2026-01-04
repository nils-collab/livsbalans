import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Livsbalans - Skapa balans i ditt liv';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1a7a8a 0%, #125E6A 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          {/* Logo box */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 24,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 24,
            }}
          >
            <span
              style={{
                fontSize: 80,
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              和
            </span>
          </div>
          
          {/* App name */}
          <span
            style={{
              fontSize: 72,
              color: 'white',
              fontWeight: 300,
              letterSpacing: '-0.02em',
            }}
          >
            livsbalans.co
          </span>
        </div>
        
        {/* Tagline */}
        <p
          style={{
            fontSize: 32,
            color: 'rgba(255, 255, 255, 0.85)',
            fontWeight: 400,
            textAlign: 'center',
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Bedöm din livssituation och skapa en plan för bättre balans
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}

