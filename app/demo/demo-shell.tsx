"use client";

import { useLayoutEffect, type ReactNode } from "react";

export function DemoShell({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    const html = document.documentElement;
    const { body } = document;
    html.classList.add("parley-demo-page");
    body.classList.add("parley-demo-page");
    return () => {
      html.classList.remove("parley-demo-page");
      body.classList.remove("parley-demo-page");
    };
  }, []);

  return children;
}
