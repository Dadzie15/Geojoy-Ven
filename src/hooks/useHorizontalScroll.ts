"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ScrollState = { atStart: boolean; atEnd: boolean; page: number; pages: number };

/**
 * State and controls for a horizontally scrolling list. Arrows move one visible width;
 * smooth scrolling comes from the container's `scroll-smooth` class (off for reduced motion).
 */
export function useHorizontalScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [state, setState] = useState<ScrollState>({ atStart: true, atEnd: true, page: 1, pages: 1 });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollLeft, clientWidth, scrollWidth } = el;
    // A couple of pixels of slack absorbs sub-pixel rounding of item widths.
    const pages = Math.max(1, Math.ceil((scrollWidth - 2) / clientWidth));
    setState({
      atStart: scrollLeft <= 2,
      atEnd: scrollLeft + clientWidth >= scrollWidth - 2,
      page: Math.min(pages, Math.round(scrollLeft / clientWidth) + 1),
      pages,
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [update]);

  const scrollPage = useCallback((direction: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: direction * el.clientWidth });
  }, []);

  return { ref, ...state, scrollPage };
}
