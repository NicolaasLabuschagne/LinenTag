import { ImageResponse } from 'next/og';

export const alt = 'LinenTag: tap any sheet and instantly know exactly what it is';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Social sharing image, generated at build time (also used for Twitter cards). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#FAF8F5',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: '#556B5D',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 6,
              padding: '0 14px',
            }}
          >
            {[1, 0.8, 0.65].map((o) => (
              <div key={o} style={{ height: 8, width: 30, borderRadius: 4, background: '#FAF8F5', opacity: o }} />
            ))}
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#1F2937', fontFamily: 'serif' }}>LinenTag</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 80, fontWeight: 500, color: '#1F2937', lineHeight: 1.04, letterSpacing: -2, fontFamily: 'serif' }}>
            Never guess which sheet is which again
          </div>
          <div style={{ fontSize: 32, color: '#556B5D', marginTop: 28 }}>Washable NFC tags for bedding · Tap with your phone</div>
        </div>
      </div>
    ),
    size,
  );
}
