"use client";

import { Bot } from "lucide-react";

type Brand = "meta" | "google" | "tiktok" | "gemini";

export function BrandIcon({ brand, className = "w-5 h-5" }: { brand: Brand; className?: string }) {
  if (brand === "google") {
    return (
      <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#34A853" d="M7 40h8.8L29.2 8h-8.8L7 40Z" />
        <path fill="#FBBC04" d="M20.4 40h8.8l6.3-15.2h-8.8L20.4 40Z" />
        <path fill="#4285F4" d="M29.2 8 41 40h-8.8L20.4 8h8.8Z" />
        <circle cx="12" cy="36" r="5" fill="#34A853" />
        <circle cx="36" cy="36" r="5" fill="#4285F4" />
      </svg>
    );
  }

  if (brand === "meta") {
    return (
      <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
        <path
          fill="none"
          stroke="#1877F2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="5"
          d="M7 30c4-11 8-16 13-16 4 0 7 4 10 9 3 5 5 7 8 7 4 0 6-4 3-9-2-4-5-7-9-7-6 0-10 7-14 16-3 6-7 8-10 5-2-2-2-4-1-5Z"
        />
      </svg>
    );
  }

  if (brand === "tiktok") {
    return (
      <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#25F4EE" d="M28 7h6c.6 5 3.4 8.5 8 10v7c-3.2-.1-6-1.1-8.5-3v11.2C33.5 39.1 28.8 44 21.8 44 15.3 44 10 38.8 10 32.4c0-7.4 6.4-12.8 13.7-11.5v7.3c-3.2-1-6.3 1.2-6.3 4.2 0 2.6 2 4.6 4.6 4.6 3.1 0 5.2-2.3 5.2-5.8V7H28Z" opacity=".9" />
        <path fill="#FE2C55" d="M25 7h6c.6 5 3.4 8.5 8 10v7c-3.2-.1-6-1.1-8.5-3v11.2C30.5 39.1 25.8 44 18.8 44 12.3 44 7 38.8 7 32.4c0-7.4 6.4-12.8 13.7-11.5v7.3c-3.2-1-6.3 1.2-6.3 4.2 0 2.6 2 4.6 4.6 4.6 3.1 0 5.2-2.3 5.2-5.8V7H25Z" />
        <path fill="#111" d="M26.8 7h4.4c.6 5 3.4 8.5 8 10v4.5c-3.2-.1-6-1.1-8.5-3v13.7C30.7 39.1 26 44 19 44c-2.2 0-4.2-.6-5.9-1.6 1.6.8 3.4 1.2 5.4 1.2 7 0 11.7-4.9 11.7-11.8V18.1c2.5 1.9 5.3 2.9 8.5 3v-2.9c-6-2-9.9-5.7-11.9-11.2Z" />
      </svg>
    );
  }

  return <Bot className={className} style={{ color: "#8B5CF6" }} strokeWidth={2.5} />;
}
