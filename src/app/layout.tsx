// Updated src/app/layout.tsx to include AuthProvider
import { Metadata } from 'next';
import ClientProviders from '@/providers/ClientProviders';
import './globals.css';

export const metadata: Metadata = {
  title: 'E-Commerce Client',
  /*description: 'Next.js-based e-commerce platform',
  keywords: ['e-commerce', 'online shopping', 'retail'],
  authors: [{ name: 'Your Name', url: 'https://yourwebsite.com' }],
  creator: 'Your Company Name',
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  themeColor: '#4CAF50',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    url: 'https://yourdomain.com',
    title: 'E-Commerce Client',
    description: 'Next.js-based e-commerce platform',
    siteName: 'E-Commerce Client',
    images: [{ url: '/og-image.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'E-Commerce Client',
    description: 'Next.js-based e-commerce platform',
    images: ['/twitter-image.jpg'],
  },*/
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}