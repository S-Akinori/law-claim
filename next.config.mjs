/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'acamlwgwlmvgirarjemb.supabase.co'
            },
        ]
    }
};

export default nextConfig;
