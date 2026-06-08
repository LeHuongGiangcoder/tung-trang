import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  const logoData = readFileSync(join(process.cwd(), 'public/images/logo.png'));

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F5F2EA',
          borderRadius: '20%',
        }}
      >
        <img 
          src={`data:image/png;base64,${logoData.toString('base64')}`} 
          width="360" 
          height="360" 
          style={{ objectFit: 'contain' }}
        />
      </div>
    ),
    { ...size }
  );
}
