"use client";

import { useEffect } from "react";
import { tinykeys } from "tinykeys";

interface UseAppHotkeysOptions {
  enabled: boolean;
  onCreateIssue: () => void;
}

export function useAppHotkeys(options: UseAppHotkeysOptions): void {
  useEffect(() => {
    if (!options.enabled) {
      return undefined;
    }

    const unsubscribe = tinykeys(window, {
      "$mod+KeyK": (event) => {
        event.preventDefault();
        options.onCreateIssue();
      },
      KeyC: (event) => {
        if (event.target instanceof HTMLElement) {
          const tagName = event.target.tagName.toLowerCase();
          const isTypingTarget =
            tagName === "input" ||
            tagName === "textarea" ||
            event.target.isContentEditable;

          if (isTypingTarget) {
            return;
          }
        }

        options.onCreateIssue();
      },
    });

    return () => {
      unsubscribe();
    };
  }, [options]);
}
