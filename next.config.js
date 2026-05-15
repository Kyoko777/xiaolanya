/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 【关键】导出为静态 HTML
  images: {
    unoptimized: true, // 静态模式下必须关闭图片优化
  },
};

module.exports = nextConfig;
