import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_SCOPESTACK_API_KEY: process.env.NEXT_PUBLIC_SCOPESTACK_API_KEY,
  },
}

export default nextConfig