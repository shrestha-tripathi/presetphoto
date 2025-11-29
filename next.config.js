// TODO: Re-enable PWA features in the future
// const withPWA = require('next-pwa')({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
//   disable: process.env.NODE_ENV === 'development',
// });

// const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const isGitHubPages = false;
const repoName = 'presetphoto'; // Must match your GitHub repo name exactly (case-sensitive)

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

// TODO: Re-enable PWA - change to: module.exports = withPWA(nextConfig);
module.exports = nextConfig;

