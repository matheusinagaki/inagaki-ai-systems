"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import dynamic from "next/dynamic";
const ChatDrawer = dynamic(() => import("@/components/ui/chat-drawer").then(mod => mod.ChatDrawer), { ssr: false });
import { useDecrypt } from "@/hooks/use-decrypt";
import { CasesSection } from "@/components/sections/cases-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { ExpertiseSection } from "@/components/sections/expertise-section";
import { AboutSection } from "@/components/sections/about-section";
import { homeContent, type Language } from "@/data/home";
type Theme = "light" | "dark";

const progressSectionIds = [
  "top",
  "metricas",
  "impacto",
  "experiencia",
  "expertise",
  "sobre",
  "contato",
] as const;

const progressSectionLabels: Record<Language, Record<(typeof progressSectionIds)[number], string>> = {
  pt: {
    top: "Início",
    metricas: "Resultados",
    impacto: "Impacto",
    experiencia: "Experiência",
    expertise: "Expertise",
    sobre: "Sobre",
    contato: "Contato",
  },
  en: {
    top: "Home",
    metricas: "Results",
    impacto: "Impact",
    experiencia: "Experience",
    expertise: "Expertise",
    sobre: "About",
    contato: "Contact",
  },
};



function DecryptLine({
  text,
  animatedText,
  className = "",
}: {
  text: string;
  animatedText: string;
  className?: string;
}) {
  return (
    <span className={`decrypt-line ${className}`.trim()} aria-hidden="true">
      <span className="decrypt-line-measure">{text}</span>
      <span className="decrypt-line-animation">{animatedText}</span>
    </span>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("pt");

  useEffect(() => {
    let ticking = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const cards = document.querySelectorAll('.spotlight-card');
          cards.forEach((card) => {
            const rect = (card as HTMLElement).getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
            (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const [theme, setTheme] = useState<Theme>("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopRailOpen, setDesktopRailOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<(typeof progressSectionIds)[number]>("top");
  const [scrollProgress, setScrollProgress] = useState(0);
  const t = homeContent[language];
  const activeSectionIndex = progressSectionIds.indexOf(activeSection);
  const decryptedLine1 = useDecrypt(t.heroLine1, 35, 100);
  const decryptedLine2 = useDecrypt(t.heroLine2, 35, 400);
  const decryptedLine3 = useDecrypt(t.heroLine3, 35, 700);

  useEffect(() => {
    document.documentElement.lang = language === "pt" ? "pt-BR" : "en";
    localStorage.setItem("lang", language);
  }, [language]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const activeTheme = document.documentElement.dataset.theme;
      if (activeTheme === "light" || activeTheme === "dark") setTheme(activeTheme);
      if (localStorage.getItem("desktop-rail") === "open") setDesktopRailOpen(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    let animationFrame = 0;

    const updateProgress = () => {
      animationFrame = 0;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = documentHeight > 0
        ? Math.min(1, Math.max(0, window.scrollY / documentHeight))
        : 0;
      setScrollProgress((current) =>
        Math.abs(current - nextProgress) > 0.001 ? nextProgress : current,
      );

      const activationLine = window.innerHeight * 0.38;
      let nextSection: (typeof progressSectionIds)[number] = "top";
      for (const sectionId of progressSectionIds) {
        const section = document.getElementById(sectionId);
        if (section && section.getBoundingClientRect().top <= activationLine) {
          nextSection = sectionId;
        }
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        nextSection = "contato";
      }
      setActiveSection((current) => current === nextSection ? current : nextSection);
    };

    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateProgress);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => {
    const closeMenu = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setDesktopRailOpen(false);
        localStorage.setItem("desktop-rail", "closed");
      }
    };
    window.addEventListener("keydown", closeMenu);
    return () => window.removeEventListener("keydown", closeMenu);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    localStorage.setItem("theme", nextTheme);
  };

  const toggleDesktopRail = () => {
    const nextState = !desktopRailOpen;
    setDesktopRailOpen(nextState);
    localStorage.setItem("desktop-rail", nextState ? "open" : "closed");
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Matheus Inagaki",
    jobTitle: "AI Systems Engineer",
    url: "https://inagaki-ai-systems.vercel.app/",
    sameAs: [
      "https://github.com/matheusinagaki",
      "https://linkedin.com/in/matheusinagaki" // Or actual LinkedIn URL
    ],
    knowsAbout: [
      "Artificial Intelligence",
      "Machine Learning",
      "Generative AI",
      "Large Language Models (LLM)",
      "Retrieval-Augmented Generation (RAG)",
      "Data Engineering",
      "Python",
      "Microsoft Azure"
    ]
  };

  return (
    <main id="top" className={desktopRailOpen ? "rail-open" : "rail-collapsed"}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a className="skip-link" href="#conteudo">
        {language === "pt" ? "Pular para o conteúdo" : "Skip to content"}
      </a>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Matheus Inagaki — início">
          <span className="brand-mark">MI</span>
          <span className="brand-name">Matheus Inagaki</span>
        </a>

        <button
          className="rail-toggle"
          type="button"
          onClick={toggleDesktopRail}
          aria-expanded={desktopRailOpen}
          aria-controls="desktop-navigation"
          aria-label={language === "pt" ? `${desktopRailOpen ? "Fechar" : "Abrir"} menu lateral` : `${desktopRailOpen ? "Close" : "Open"} side menu`}
        >
          <span className="rail-toggle-icon" aria-hidden="true">{desktopRailOpen ? "←" : "→"}</span>
          <span className="rail-toggle-label">{language === "pt" ? (desktopRailOpen ? "Recolher" : "Abrir") : (desktopRailOpen ? "Collapse" : "Open")}</span>
        </button>

        <nav id="desktop-navigation" className="desktop-nav" aria-label={language === "pt" ? "Navegação principal" : "Main navigation"}>
          {t.nav.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className={activeSection === href.slice(1) ? "active" : undefined}
              aria-current={activeSection === href.slice(1) ? "location" : undefined}
            >
              {label}
            </a>
          ))}
        </nav>

        <nav
          className="section-progress"
          aria-label={language === "pt" ? "Navegação por seções" : "Section navigation"}
          style={{ "--scroll-progress": scrollProgress } as CSSProperties}
        >
          <span className="section-progress-count" aria-hidden="true">
            {String(activeSectionIndex + 1).padStart(2, "0")}/{String(progressSectionIds.length).padStart(2, "0")}
          </span>
          <span className="section-progress-track" aria-hidden="true">
            <span className="section-progress-fill" />
          </span>
          {progressSectionIds.map((sectionId, index) => (
            <a
              key={sectionId}
              href={`#${sectionId}`}
              className={`section-progress-marker ${sectionId === activeSection ? "active" : ""} ${index < activeSectionIndex ? "complete" : ""}`.trim()}
              style={{ "--section-position": index / (progressSectionIds.length - 1) } as CSSProperties}
              aria-label={progressSectionLabels[language][sectionId]}
              data-label={progressSectionLabels[language][sectionId]}
              aria-current={sectionId === activeSection ? "location" : undefined}
            >
              <span className="section-progress-dot" aria-hidden="true" />
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <div className="language-switch" aria-label={language === "pt" ? "Selecionar idioma" : "Select language"}>
            <button className={language === "pt" ? "active" : ""} onClick={() => setLanguage("pt")} aria-pressed={language === "pt"}>PT</button>
            <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")} aria-pressed={language === "en"}>EN</button>
          </div>
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-pressed={theme === "dark"}
            aria-label={language === "pt" ? `Ativar modo ${theme === "dark" ? "claro" : "escuro"}` : `Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            <span className="theme-icon" aria-hidden="true">{theme === "dark" ? "☾" : "☼"}</span>
            <span className="theme-label">{theme === "dark" ? "Dark" : "Light"}</span>
          </button>
          <a className="github-link" href="https://github.com/matheusinagaki" target="_blank" rel="noreferrer" style={{ color: "var(--muted-strong)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 500 }}>
            GitHub<span aria-hidden="true">↗</span>
          </a>
          <a className="resume-link" href="/Matheus-Inagaki-CV.pdf" download>
            {t.resume}<span aria-hidden="true">↓</span>
          </a>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={language === "pt" ? "Abrir navegação" : "Open navigation"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span /><span />
          </button>
        </div>
      </header>

      <nav id="mobile-navigation" className={`mobile-nav ${menuOpen ? "open" : ""}`} aria-label={language === "pt" ? "Navegação mobile" : "Mobile navigation"}>
        <div className="mobile-nav-inner">
          {t.nav.map(([label, href], index) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>
              <span>0{index + 1}</span>{label}
            </a>
          ))}
          <div className="mobile-nav-actions">
            <a href="/Matheus-Inagaki-CV.pdf" download onClick={() => setMenuOpen(false)}>{t.resume}<span aria-hidden="true">↓</span></a>
            <a href="mailto:matheusv.inagaki@gmail.com" onClick={() => setMenuOpen(false)}>{t.contact}<span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </nav>

      <div id="conteudo">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-glow" aria-hidden="true" />
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-content">
            <div className="hero-copy">
              <div className="availability"><span className="availability-dot" />{t.available}</div>
              <p className="hero-role">{t.role}</p>
              <h1 id="hero-title" aria-label={`${t.heroLine1} ${t.heroLine2} ${t.heroLine3}`}>
                <DecryptLine text={t.heroLine1} animatedText={decryptedLine1} />
                <DecryptLine text={t.heroLine2} animatedText={decryptedLine2} />
                <DecryptLine text={t.heroLine3} animatedText={decryptedLine3} className="accent-line" />
              </h1>
              <p className="hero-description">{t.heroCopy}</p>
              <div className="hero-actions">
                <MagneticButton><a className="button button-primary" href="mailto:matheusv.inagaki@gmail.com">
                  {t.contact}<span aria-hidden="true">↗</span>
                </a></MagneticButton>
                <MagneticButton><a className="button button-secondary" href="#impacto">
                  {t.explore}<span aria-hidden="true">↓</span>
                </a></MagneticButton>
              </div>
            </div>

            <div className="system-card" role="figure" aria-label={language === "pt" ? "Painel visual de sistemas de IA" : "AI systems visual panel"}>
              <div className="system-topline">
                <span>{t.system}</span><span>v2.6.1</span>
              </div>
              <div className="orbital-system" aria-hidden="true">
                <div className="orbit orbit-one"><span /></div>
                <div className="orbit orbit-two"><span /></div>
                <div className="core-node"><span>AI</span></div>
              </div>
              <div className="system-status"><span className="status-pulse" />{t.systemStatus}</div>
              <div className="system-list">
                {t.systemItems.map(([label, value], index) => (
                  <div className="system-row" key={label}>
                    <span className="system-index">0{index + 1}</span>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <a className="scroll-cue" href="#metricas"><span>{t.scroll}</span><i aria-hidden="true" /></a>
        </section>

        <section className="metrics" id="metricas" aria-label={language === "pt" ? "Resultados em números" : "Results in numbers"}>
          {t.stats.map(([value, label]) => (
            <div className="metric" key={value}>
              <strong>{value}</strong><span>{label}</span>
            </div>
          ))}
        </section>

        <CasesSection language={language} />

        <ExperienceSection language={language} />

        <ExpertiseSection language={language} />

        <AboutSection language={language} />

        <section className="contact-section" id="contato">
          <div className="contact-orb" aria-hidden="true" />
          <div className="contact-content reveal">
            <p className="eyebrow">{t.ctaEyebrow}</p>
            <h2>{t.ctaTitle}</h2><p>{t.ctaCopy}</p>
            <div className="contact-actions">
              <a className="button button-light" href="mailto:matheusv.inagaki@gmail.com">{t.email}<span aria-hidden="true">↗</span></a>
              <a className="button button-outline" href="https://linkedin.com/in/matheusinagaki" target="_blank" rel="noreferrer">{t.linkedin}<span aria-hidden="true">↗</span></a>
            </div>
            <p style={{ marginTop: "24px", color: "var(--muted)", fontSize: "0.85rem" }}>
              {language === "pt" ? "Ou copie o endereço:" : "Or copy the address:"} <span style={{ color: "var(--text)", userSelect: "all" }}>matheusv.inagaki@gmail.com</span>
            </p>
          </div>
        </section>
      </div>

      <footer>
        <div className="footer-brand"><span className="brand-mark">MI</span><span>© {new Date().getFullYear()} Matheus Inagaki</span></div>
        <p>{t.footer}</p>
        <div className="footer-links">
          <a href="https://github.com/matheusinagaki" target="_blank" rel="noreferrer">GitHub ↗</a>
          <a href="https://linkedin.com/in/matheusinagaki" target="_blank" rel="noreferrer">LinkedIn ↗</a>
          <a href="#top">{t.backTop} ↑</a>
        </div>
      </footer>
      <ChatDrawer />
    </main>
  );
}
