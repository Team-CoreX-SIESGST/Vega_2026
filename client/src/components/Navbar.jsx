'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

import { Sparkles, Menu, X } from 'lucide-react';
import { AutoAwesome, Menu as MenuIcon, Close } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Analytics', href: '#analytics' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Resources', href: '#resources' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-4 mt-4">
        <nav className="glass-card px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-bold">BearCart</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link href="/auth/login">
                <button className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
                  Sign In
                </button>
              </Link>
              <Link href="/auth/register">
                <button className="btn-primary-glow text-sm px-6 py-2">
                  Get Started
                </button>
              </Link>
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pt-6 pb-2"
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <Link href="/auth/login">
                    <button className="text-muted-foreground hover:text-foreground transition-colors py-2 text-left w-full">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/auth/register">
                    <button className="btn-primary-glow text-sm py-3">
                      Get Started
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </nav>
      </div>
    </motion.header>
  );
};

export default Navbar;