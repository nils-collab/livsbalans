"use client";

import { HamburgerMenu } from "./HamburgerMenu";

interface HeaderProps {
  isAdmin?: boolean;
  onShare?: () => void;
  onLogout?: () => void;
}

export function Header({ isAdmin = false, onShare, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-4xl">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-soft">
            <span className="text-white text-lg font-bold">和</span>
          </div>
          <span className="text-lg font-heading font-light text-foreground tracking-tight">
            livsbalans.co
          </span>
        </div>

        {/* Hamburger Menu */}
        <HamburgerMenu 
          isAdmin={isAdmin} 
          onShare={onShare} 
          onLogout={onLogout} 
        />
      </div>
    </header>
  );
}

