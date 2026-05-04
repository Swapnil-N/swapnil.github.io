'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { roleHasPermission } from '@/lib/auth/permissions.client';
import { ADMIN_PERMISSIONS } from '@/lib/auth/admin-permissions';

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'Resume' },
  { href: '/travel', label: 'Travel' },
  { href: '/contact', label: 'Contact' },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const showAdmin = !!auth?.role && ADMIN_PERMISSIONS.some((p) => roleHasPermission(auth.role, p));

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        setSigningOut(false);
        return;
      }
      setMobileOpen(false);
      router.replace('/');
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  }

  function renderAuthControls(closeMenu?: () => void) {
    if (!auth) {
      return (
        <Link
          href="/login"
          onClick={closeMenu}
          className={`text-sm transition-colors ${
            pathname === '/login' ? 'text-primary' : 'text-muted hover:text-primary'
          }`}
        >
          Login
        </Link>
      );
    }

    return (
      <div className="flex items-center gap-4">
        {showAdmin && (
          <Link
            href="/admin"
            onClick={closeMenu}
            className={`text-sm transition-colors ${
              pathname.startsWith('/admin') ? 'text-primary' : 'text-muted hover:text-primary'
            }`}
          >
            Admin
          </Link>
        )}
        <Link
          href="/account"
          onClick={closeMenu}
          className={`text-sm transition-colors ${
            pathname.startsWith('/account') ? 'text-primary' : 'text-muted hover:text-primary'
          }`}
          title={auth.profile.email}
        >
          {auth.profile.display_name ?? 'Account'}
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="text-sm text-muted hover:text-primary transition-colors disabled:opacity-50"
        >
          {signingOut ? 'Signing out…' : 'Log out'}
        </button>
      </div>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 h-16">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-primary font-heading"
        >
          SN
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 text-sm transition-colors ${
                  isActive ? 'text-primary' : 'text-foreground hover:text-primary'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
          <span className="text-border select-none">|</span>
          {renderAuthControls()}
        </div>

        <div className="flex md:hidden items-center gap-2">
          <button
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="relative flex flex-col items-center justify-center w-10 h-10 rounded-full hover:bg-border transition-colors"
          >
            <motion.span
              className="block h-0.5 w-5 bg-foreground rounded-full absolute"
              animate={mobileOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
              transition={{ duration: 0.25 }}
            />
            <motion.span
              className="block h-0.5 w-5 bg-foreground rounded-full absolute"
              animate={mobileOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
              transition={{ duration: 0.25 }}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-b border-border bg-surface/95 backdrop-blur-md"
          >
            <div className="flex flex-col px-4 py-4 gap-1">
              {links.map((link) => {
                const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-foreground hover:text-primary hover:bg-border'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="border-t border-border mt-2 pt-2 flex flex-col gap-1">
                {auth ? (
                  <>
                    {showAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2 rounded-lg text-sm text-muted hover:text-primary hover:bg-border transition-colors"
                      >
                        Admin
                      </Link>
                    )}
                    <Link
                      href="/account"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm text-muted hover:text-primary hover:bg-border transition-colors"
                    >
                      {auth.profile.display_name ?? 'Account'}
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="text-left block px-3 py-2 rounded-lg text-sm text-muted hover:text-primary hover:bg-border transition-colors disabled:opacity-50"
                    >
                      {signingOut ? 'Signing out…' : 'Log out'}
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      pathname === '/login'
                        ? 'text-primary bg-primary/10'
                        : 'text-muted hover:text-primary hover:bg-border'
                    }`}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
