/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /**
   * `next build` and `next dev` share `.next` by default, so running a build while
   * the dev server is up overwrites the chunks it is serving and the running page
   * loses its CSS and client bundle. Verification builds set NEXT_DIST_DIR to keep
   * out of the dev server's way; deployments use the default.
   */
  distDir: process.env.NEXT_DIST_DIR || '.next',
  async headers() {
    return [
      {
        // Models and the draco decoder are content-addressed by build; cache hard.
        source: '/:path*.(glb|wasm)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
}

export default nextConfig
