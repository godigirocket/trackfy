"use client";

import * as React from "react";

// Mock implementation of useToast for build stability
export function useToast() {
  const toast = ({ title, description }: { title: string; description?: string }) => {
    console.log(`[Toast] ${title}: ${description}`);
    // In a real app, this would trigger a state change in a toaster component
  };

  return {
    toast,
  };
}
