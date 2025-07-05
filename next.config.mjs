// next.config.mjs  — formato ESM
import nextMdx from '@next/mdx';

const withMDX = nextMdx();

/** @type {import('next').NextConfig} */
export default withMDX({
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
});
