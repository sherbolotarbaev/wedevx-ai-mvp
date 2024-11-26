/** @type {import('next').NextConfig} */
const nextConfig = {
	transpilePackages: ['next-mdx-remote'],
	images: {
		formats: ['image/avif', 'image/webp'],
		domains: ['www.sherbolotarbaev.co'],
	},
}

export default nextConfig
