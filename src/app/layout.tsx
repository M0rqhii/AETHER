import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import './overlay.css'

/**
 * Absolute base for the OG/Twitter image URLs. On Vercel this is the project's
 * real production domain (preview deployments are resolved to their own URL by
 * Next itself); a hard-coded host would point social cards at someone else's site
 * whenever the project is deployed under a different name.
 */
const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL

export const metadata: Metadata = {
  metadataBase: new URL(productionHost ? `https://${productionHost}` : 'http://localhost:3000'),
  title: 'AETHR ONE — Temperature. Engineered.',
  description:
    'A fictional interactive premium thermal vessel experience built around precision engineering, smart sensing and advanced thermal design.',
  applicationName: 'AETHR ONE',
  authors: [{ name: 'AETHR' }],
  keywords: [
    'AETHR',
    'AETHR ONE',
    'precision thermal vessel',
    'industrial design',
    'interactive 3D',
    'product experience',
  ],
  openGraph: {
    type: 'website',
    title: 'AETHR ONE — Temperature. Engineered.',
    description:
      'A fictional interactive premium thermal vessel experience built around precision engineering, smart sensing and advanced thermal design.',
    siteName: 'AETHR',
    images: [{ url: '/aethr-one-render.png', width: 1080, height: 1440, alt: 'AETHR ONE precision thermal vessel' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AETHR ONE — Temperature. Engineered.',
    description: 'A fictional interactive premium thermal vessel experience.',
    images: ['/aethr-one-render.png'],
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#070809',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      {/* No <link rel="preload"> for the GLB: drei's own `useGLTF.preload` starts
          the fetch, and the tag's request never matched it — Chrome downloaded the
          model twice and then warned that the preload went unused. */}
      {/* Browser extensions commonly stamp classes and attributes onto <body>
          before React hydrates (a VPN or theme add-on adding `vc-init`, for
          example). That is outside the app's control and harmless, so the
          mismatch is suppressed here rather than reported as an app error. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
