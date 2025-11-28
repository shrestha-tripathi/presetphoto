const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const repoName = 'PresetPhoto'; // Change this to your actual repo name

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // GitHub Pages deployment config
  basePath: isGitHubPages ? `/${repoName}` : '',
  assetPrefix: isGitHubPages ? `/${repoName}/` : '',
};

module.exports = withPWA(nextConfig);
