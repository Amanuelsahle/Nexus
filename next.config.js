/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // JSON & TXT as buffers (already in place)
    config.module.rules.unshift({
      test: /\.(json|txt)$/i,
      type: 'asset/resource',
      generator: { emit: true },
    });

    // Catch other large static assets (SVG, images, etc.)
    config.module.rules.unshift({
      test: /\.(svg|png|jpe?g|ico|webp|gif)$/i,
      type: 'asset/resource',
    });

    // Optional: turn off performance hints entirely (less noisy)
    config.performance = { hints: false };

    return config;
  },
};

module.exports = nextConfig;
