"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

type ReturnLocation = { slug: string; scrollY: number; width: number; artworkTop: number; language: string };
type Flight = {
  slug: string;
  pathname: string;
  scrollY: number;
  clone: HTMLElement | null;
  from: DOMRect | null;
  target: HTMLElement | null;
  visibility: string;
  animation: Animation | null;
  timeout: number;
  finishing: boolean;
};

type CaseNavigation = {
  openCase: (slug: string) => void;
  returnToCases: (slug: string) => void;
};

const CaseNavigationContext = createContext<CaseNavigation | null>(null);
const nextFrame = () => new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));

function findArtwork(slug: string) {
  return document.querySelector<HTMLElement>(`[data-case-art="${CSS.escape(slug)}"]`);
}

function rememberLocation(slug: string): ReturnLocation {
  return {
    slug, scrollY: window.scrollY, width: window.innerWidth,
    artworkTop: findArtwork(slug)?.getBoundingClientRect().top ?? 120,
    language: document.documentElement.lang,
  };
}

export function CaseNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = useRef(pathname);
  const returnLocation = useRef<ReturnLocation | null>(null);
  const pending = useRef<Flight | null>(null);

  const cleanup = useCallback(() => {
    const flight = pending.current;
    if (!flight) return;
    pending.current = null;
    window.clearTimeout(flight.timeout);
    flight.animation?.cancel();
    flight.clone?.remove();
    if (flight.target) flight.target.style.visibility = flight.visibility;
    delete document.documentElement.dataset.caseTransition;
  }, []);

  const begin = useCallback((slug: string, targetPath: string, scrollY: number) => {
    cleanup();
    const artwork = findArtwork(slug);
    const rect = artwork?.getBoundingClientRect() ?? null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const visible = rect && rect.bottom > 0 && rect.top < window.innerHeight;
    let clone: HTMLElement | null = null;

    if (artwork && rect && visible && !reduced && typeof artwork.animate === "function") {
      clone = artwork.cloneNode(true) as HTMLElement;
      clone.removeAttribute("data-case-art");
      clone.classList.add("case-transition-art");
      clone.setAttribute("aria-hidden", "true");
      Object.assign(clone.style, {
        left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`,
      });
      document.body.appendChild(clone);
    }

    const flight: Flight = {
      slug, pathname: targetPath, scrollY, clone, from: rect, target: null,
      visibility: "", animation: null, timeout: 0, finishing: false,
    };
    pending.current = flight;
    document.documentElement.dataset.caseTransition = "loading";
    // Navigation still completes normally if the animation cannot finish.
    flight.timeout = window.setTimeout(cleanup, 8_000);
  }, [cleanup]);

  const finish = useCallback(async (flight: Flight) => {
    if (flight.finishing) return;
    flight.finishing = true;
    window.scrollTo({ top: flight.scrollY, behavior: "instant" });
    // Let the destination restore its language and measure the final layout.
    await nextFrame();
    await nextFrame();
    if (pending.current !== flight) return;
    const target = findArtwork(flight.slug);
    const record = returnLocation.current;
    let scrollY = flight.scrollY;
    if (flight.pathname === "/" && target && record?.slug === flight.slug
      && (record.width !== window.innerWidth || record.language !== document.documentElement.lang)) {
      const top = Math.min(Math.max(record.artworkTop, 96), window.innerHeight * 0.4);
      scrollY = Math.max(0, window.scrollY + target.getBoundingClientRect().top - top);
    }
    window.scrollTo({ top: scrollY, behavior: "instant" });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (target && flight.clone && flight.from && !reduced) {
      const to = target.getBoundingClientRect();
      flight.target = target;
      flight.visibility = target.style.visibility;
      target.style.visibility = "hidden";
      document.documentElement.dataset.caseTransition = "animating";
      flight.animation = flight.clone.animate([
        { left: `${flight.from.left}px`, top: `${flight.from.top}px`, width: `${flight.from.width}px`, height: `${flight.from.height}px` },
        { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px` },
      ], { duration: 560, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" });

      try { await flight.animation.finished; } catch { /* A cancelled animation must not block the route. */ }
    }

    if (pending.current !== flight) return;
    cleanup();
    if (flight.pathname === "/") {
      document.querySelector<HTMLElement>(`[data-case-link="${CSS.escape(flight.slug)}"]`)?.focus({ preventScroll: true });
    } else {
      document.querySelector<HTMLElement>(".case-study-page h1")?.focus({ preventScroll: true });
    }
  }, [cleanup]);

  useLayoutEffect(() => {
    currentPath.current = pathname;
    const flight = pending.current;
    if (flight?.pathname === pathname) void finish(flight);
  }, [pathname, finish]);

  useEffect(() => {
    const onPopState = () => {
      const destination = window.location.pathname;
      if (pending.current && pending.current.pathname !== destination) cleanup();
      if (pending.current) return;

      const record = returnLocation.current;
      const sourceSlug = currentPath.current.match(/^\/case\/([^/]+)$/)?.[1];
      const targetSlug = destination.match(/^\/case\/([^/]+)$/)?.[1];
      if (destination === "/" && sourceSlug && record?.slug === sourceSlug) {
        begin(sourceSlug, "/", record.scrollY);
      } else if (currentPath.current === "/" && targetSlug && record?.slug === targetSlug) {
        returnLocation.current = rememberLocation(targetSlug);
        begin(targetSlug, destination, 0);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [begin, cleanup]);

  useEffect(() => cleanup, [cleanup]);

  useEffect(() => {
    const finishAnimation = () => pending.current?.animation?.finish();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    window.addEventListener("resize", finishAnimation);
    reduced.addEventListener("change", finishAnimation);
    return () => {
      window.removeEventListener("resize", finishAnimation);
      reduced.removeEventListener("change", finishAnimation);
    };
  }, []);

  const openCase = useCallback((slug: string) => {
    if (pending.current) return;
    returnLocation.current = rememberLocation(slug);
    begin(slug, `/case/${slug}`, 0);
    router.push(`/case/${slug}`, { scroll: false });
  }, [begin, router]);

  const returnToCases = useCallback((slug: string) => {
    if (pending.current) return;
    const record = returnLocation.current;
    if (record?.slug === slug) {
      begin(slug, "/", record.scrollY);
      router.back();
    } else {
      router.push("/#impacto");
    }
  }, [begin, router]);

  const value = useMemo(() => ({ openCase, returnToCases }), [openCase, returnToCases]);
  return <CaseNavigationContext.Provider value={value}>{children}</CaseNavigationContext.Provider>;
}

export function useCaseNavigation() {
  const context = useContext(CaseNavigationContext);
  if (!context) throw new Error("Case navigation requires CaseNavigationProvider");
  return context;
}
