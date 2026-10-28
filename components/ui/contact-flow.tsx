"use client";

import { useEffect, useRef } from "react";

const LINE_COUNT = 32;
const SAMPLE_COUNT = 65;
type Point = { x: number; y: number };

function createFlowPaths(width: number, height: number, pointer: Point | null = null): string[] {
  return Array.from({ length: LINE_COUNT }, (_, index) => {
    const delta = index - (LINE_COUNT - 1) / 2;
    const points: string[] = [];

    for (let sample = 0; sample <= SAMPLE_COUNT; sample += 1) {
      const t = sample / SAMPLE_COUNT;
      let x = t * width * 1.2 - width * 0.06;
      let y = height * 0.57 + delta * (height / 55)
        + Math.sin(t * 5.3 - 1.8) * height * 0.15
        + Math.sin(t * 2.8 + delta * 0.018) * delta * 3;
      const centerX = width * 0.83;
      const centerY = height * 0.48;
      const dx = x - centerX;
      const dy = y - centerY;
      const turn = 1.9 * Math.exp(-(dx * dx + dy * dy) / (height * height * 0.43));

      x = centerX + dx * Math.cos(turn) - dy * Math.sin(turn);
      y = centerY + dx * Math.sin(turn) + dy * Math.cos(turn);

      if (pointer) {
        const px = x - pointer.x;
        const py = y - pointer.y;
        const influence = Math.exp(-(px * px + py * py) / (height * height * 0.09));
        x += px * influence * 0.12;
        y += py * influence * 0.2;
      }

      points.push(`${sample ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`);
    }

    return points.join(" ");
  });
}

const INITIAL_PATHS = createFlowPaths(1200, 600);

export function ContactFlow() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const region = svg?.closest("section");
    if (!svg || !region) return;

    const paths = Array.from(svg.querySelectorAll("path"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const desktop = window.matchMedia("(min-width: 761px)");
    let pointer: Point | null = null;
    let frame = 0;

    const isInteractive = () => !reducedMotion.matches && finePointer.matches && desktop.matches;

    const draw = () => {
      frame = 0;
      const { width, height } = region.getBoundingClientRect();
      if (!width || !height) return;

      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.dataset.interactive = String(isInteractive());
      createFlowPaths(width, height, isInteractive() ? pointer : null).forEach((d, index) => {
        paths[index].setAttribute("d", d);
      });
    };

    const scheduleDraw = () => {
      if (!frame) frame = window.requestAnimationFrame(draw);
    };

    const reset = () => {
      pointer = null;
      scheduleDraw();
    };

    const move = (event: PointerEvent) => {
      if (!isInteractive()) return;
      const rect = region.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      scheduleDraw();
    };

    // Draw only on interaction or resize; there is no continuous animation loop.
    const observer = new ResizeObserver(reset);
    observer.observe(region);
    region.addEventListener("pointermove", move);
    region.addEventListener("pointerleave", reset);
    reducedMotion.addEventListener("change", reset);
    finePointer.addEventListener("change", reset);
    desktop.addEventListener("change", reset);
    draw();

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      region.removeEventListener("pointermove", move);
      region.removeEventListener("pointerleave", reset);
      reducedMotion.removeEventListener("change", reset);
      finePointer.removeEventListener("change", reset);
      desktop.removeEventListener("change", reset);
    };
  }, []);

  return (
    <svg ref={svgRef} className="contact-flow" data-testid="contact-flow" viewBox="0 0 1200 600" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      {INITIAL_PATHS.map((d, index) => (
        <path key={index} d={d} strokeWidth={index % 6 === 0 ? 1 : 0.65} opacity={index % 6 === 0 ? 0.45 : 0.26} />
      ))}
    </svg>
  );
}
