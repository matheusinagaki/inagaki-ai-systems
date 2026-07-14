"use client";

import { useState, useEffect } from "react";

const chars = "!<>-_\\\\/[]{}—=+*^?#________";

export function useDecrypt(text: string, speed: number = 50, delay: number = 0) {
  // Inicialmente renderiza o texto original para SEO e SSR
  const [displayText, setDisplayText] = useState(text);
  const [isStarted, setIsStarted] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Use setTimeout to avoid synchronous setState inside an effect
    const mountTimer = setTimeout(() => {
      setHasMounted(true);
      // Assim que monta no cliente, embaralha tudo imediatamente
      setDisplayText(
        text.split("").map((letter) => letter === " " ? " " : chars[Math.floor(Math.random() * chars.length)]).join("")
      );
    }, 0);

    const startTimer = setTimeout(() => {
      setIsStarted(true);
    }, delay);
    return () => {
      clearTimeout(mountTimer);
      clearTimeout(startTimer);
    };
  }, [delay, text]);

  useEffect(() => {
    if (!isStarted || !hasMounted) return;

    let iteration = 0;

    const maxIterations = text.length;

    const interval = setInterval(() => {
      setDisplayText(() => {
        return text
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return text[index];
            }
            return letter === " " ? " " : chars[Math.floor(Math.random() * chars.length)];
          })
          .join("");
      });

      if (iteration >= maxIterations) {
        clearInterval(interval);
      }

      iteration += 1 / 2;
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, isStarted, hasMounted]);

  // Durante o SSR retorna o texto limpo, no cliente retorna a string animada
  return hasMounted ? displayText : text;
}
