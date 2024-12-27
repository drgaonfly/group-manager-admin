/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  corePlugins: {
    preflight: false, // 禁用 preflight，避免和 antd 样式冲突
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
