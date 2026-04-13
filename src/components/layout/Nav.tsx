'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const links = [
  { href: '/', label: 'Home' },
  { href: '/travel', label: 'Travel' },
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 h-16">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-[var(--color-primary)] font-heading"
        >
          SN
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 text-sm transition-colors ${
                  isActive
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-text)] hover:text-[var(--color-primary)]'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-[var(--color-primary)] rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
          <ThemeToggle />
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="relative flex flex-col items-center justify-center w-10 h-10 rounded-full hover:bg-[var(--color-border)] transition-colors"
          >
            <motion.span
              className="block h-0.5 w-5 bg-[var(--color-text)] rounded-full absolute"
              animate={
                mobileOpen
                  ? { rotate: 45, y: 0 }
                  : { rotate: 0, y: -4 }
              }
              transition={{ duration: 0.25 }}
            />
            <motion.span
              className="block h-0.5 w-5 bg-[var(--color-text)] rounded-full absolute"
              animate={
                mobileOpen
                  ? { rotate: -45, y: 0 }
                  : { rotate: 0, y: 4 }
              }
              transition={{ duration: 0.25 }}
            />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md"
          >
            <div className="flex flex-col px-4 py-4 gap-1">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                        : 'text-[var(--color-text)] hover:text-[var(--color-primary)] hover:bg-[var(--color-border)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
