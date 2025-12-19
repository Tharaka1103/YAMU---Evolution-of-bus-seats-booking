"use client";

import Image from "next/image";
import { Bus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-lg font-bold">Y<span className="text-chart-2">AM</span>U</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sri Lanka&apos;s first carbon-neutral bus booking platform. Travel smarter, travel greener.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm tracking-tight">Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Book Ticket
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Developer Info */}
          <div>
            <div className="space-y-4">
              {/* Logo */}
              <div className="w-32 h-auto">
                <Image
                  src="/logo.png"
                  alt="Trimids Logo"
                  width={128}
                  height={128}
                  className="w-full h-auto"
                  priority
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Developed by <span className="text-primary font-medium">Trimids</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  A team of passionate developers building the future of travel in Sri Lanka.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center md:text-left">
            &copy; {currentYear} YAMU. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground font-medium">
            Travel Smarter. Travel Greener.
          </p>
        </div>
      </div>
    </footer>
  );
}
