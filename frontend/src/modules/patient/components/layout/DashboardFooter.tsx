import { Instagram, Facebook, Twitter } from "lucide-react";

export function DashboardFooter() {
  return (
    <footer className="bg-primary py-4 text-primary-foreground">
      <div className="container mx-auto flex items-center justify-between px-6">
        <p className="text-sm">© BloodLine 2025 — All Rights Reserved</p>
        <div className="flex gap-4">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-80"
          >
            <Instagram className="h-5 w-5" />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-80"
          >
            <Facebook className="h-5 w-5" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-80"
          >
            <Twitter className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
