"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Share2, Download, Settings, LogOut, Shield, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HamburgerMenuProps {
  isAdmin?: boolean;
  onShare?: () => void;
  onLogout?: () => void;
}

export function HamburgerMenu({ isAdmin = false, onShare, onLogout }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleShare = () => {
    onShare?.();
    setIsOpen(false);
  };

  const handleLogout = () => {
    onLogout?.();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Hamburger Button - z-[70] to be above backdrop */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-[70]"
        aria-label={isOpen ? "Stäng meny" : "Öppna meny"}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Backdrop - z-[60] to be above header (z-50) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-[60]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu Dropdown - z-[70] to be above backdrop */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-56 bg-card rounded-xl shadow-lg border border-border z-[70] overflow-hidden">
          <nav className="py-2">
            <button
              onClick={handleShare}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors text-left"
            >
              <Share2 className="h-4 w-4 text-muted-foreground" />
              <span>Dela appen</span>
            </button>

            <Link
              href="/pdf-export"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors"
            >
              <Download className="h-4 w-4 text-muted-foreground" />
              <span>Exportera PDF</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>Inställningar</span>
            </Link>

            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors"
            >
              <Info className="h-4 w-4 text-muted-foreground" />
              <span>Om livsbalans.co</span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors"
              >
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>Admin</span>
              </Link>
            )}

            <div className="border-t border-border my-1" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors text-left text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Logga ut</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}


