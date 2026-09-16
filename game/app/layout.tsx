import type { Metadata } from 'next';
import './globals.css';
import './archive-theme.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://shikong-liefeng-game.merry-frog-4621.chatgpt.site'),
  title: '时空裂缝 · 生活档案',
  description: '时间保护区档案终端：排程、书目、学籍、关系与编年。',
  openGraph: { title: '时空裂缝', description: 'HZ-LF 生活档案', images: [{ url: '/og.png', width: 1536, height: 1024 }] },
  twitter: { card: 'summary_large_image', title: '时空裂缝', description: 'HZ-LF 生活档案', images: ['/og.png'] },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-CN"><body>{children}</body></html>; }
