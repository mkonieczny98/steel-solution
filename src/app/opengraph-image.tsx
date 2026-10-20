import { ImageResponse } from 'next/og'
import { IMAGES, sized } from '@/lib/images'
import { site } from '@/lib/site'

export const alt = `${site.name} – zabudowy wozów strażackich na wymiar`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#101215' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={sized(IMAGES.heroTruck, 1200)} alt="" width={1200} height={630} style={{ position: 'absolute', inset: 0, objectFit: 'cover', opacity: 0.45 }} />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 72, width: '100%', background: 'linear-gradient(90deg, #101215 0%, rgba(16,18,21,0.6) 70%, rgba(16,18,21,0) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#d9132b', fontSize: 28, fontWeight: 700, letterSpacing: 6, textTransform: 'uppercase' }}>
            <div style={{ width: 48, height: 4, background: '#d9132b' }} />
            <span>{site.name}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 24, color: 'white', fontSize: 84, fontWeight: 800, lineHeight: 1, textTransform: 'uppercase' }}>
            <span>Zabudowy wozów</span>
            <div style={{ display: 'flex' }}>
              <span>strażackich</span>
              <span style={{ color: '#d9132b', marginLeft: 20 }}>na wymiar</span>
            </div>
          </div>
          <div style={{ display: 'flex', marginTop: 28, color: '#d4d4d8', fontSize: 30 }}>{`${site.phone} · ${site.email}`}</div>
        </div>
      </div>
    ),
    size
  )
}
