import React, { type ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';

interface DonationLayoutProps {
  children: ReactNode;
  title?: string;
}

// Simple appearance -> class mapping
const themeClass = (appearance: string) => {
  switch (appearance) {
    case 'light':
      return 'light';
    case 'dark':
      return 'dark';
    default:
      return 'system';
  }
};

export default function DonationLayout({ children, title }: DonationLayoutProps) {
  const { auth } = usePage().props as any;

  return (
    <div>
      <div className="min-h-screen w-full bg-neutral-50 text-neutral-900">
  <header className="w-full border-b border-black/5 mb-8 bg-white/70 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-6">
              <Link href={route('home')} className="text-xl font-bold text-blue-600">
                SRPS Donation
              </Link>
              {title && (
                <h1 className="text-sm font-medium text-neutral-600">{title}</h1>
              )}
            </div>
            <nav className="flex items-center gap-4 text-sm">
              {auth?.user ? (
                <Link href={route('dashboard')} className="rounded-sm border border-transparent px-4 py-1.5 hover:border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href={route('login')} className="rounded-sm border border-transparent px-4 py-1.5 hover:border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    Log in
                  </Link>
                  <Link href={route('register')} className="rounded-sm border border-black/10 px-4 py-1.5 hover:border-black/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-6 pb-16">{children}</main>
      </div>
    </div>
  );
}
