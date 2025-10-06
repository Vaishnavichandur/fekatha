/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // enable static export
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // required if using next/image
  },
}

export default nextConfig
