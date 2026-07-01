/** @type {import('next').NextConfig} */
const nextConfig = {
  // ให้ next build สร้าง server แบบ self-contained สำหรับ Docker (COPY แค่ .next/standalone)
  output: "standalone",
};
export default nextConfig;
