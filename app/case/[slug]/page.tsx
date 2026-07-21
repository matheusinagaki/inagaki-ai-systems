"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { casesData, Language, CaseStudy } from "@/data/cases";
import { MagneticButton } from "@/components/ui/magnetic-button";

export default function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("pt");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  
  const caseData: CaseStudy | undefined = casesData.find(
    (c) => c.slug === resolvedParams.slug
  );

  useEffect(() => {
    // Sync language from localStorage if possible
    const storedLang = localStorage.getItem("lang") as Language;
    if (storedLang === "en" || storedLang === "pt") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguage(storedLang);
    }

    const frame = window.requestAnimationFrame(() => {
      const activeTheme = document.documentElement.dataset.theme;
      if (activeTheme === "light" || activeTheme === "dark") setTheme(activeTheme);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    localStorage.setItem("theme", nextTheme);
  };

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  if (!caseData) {
    return (
      <main className="rail-collapsed">
        <section className="section text-center" style={{ minHeight: "100vh", display: "grid", placeContent: "center" }}>
          <h2>{language === "pt" ? "Estudo de caso não encontrado." : "Case study not found."}</h2>
          <br/>
          <MagneticButton>
            <button className="button button-outline" onClick={() => router.push("/")}>
              {language === "pt" ? "Voltar ao início" : "Back to home"}
            </button>
          </MagneticButton>
        </section>
      </main>
    );
  }

  return (
    <main className="rail-collapsed case-study-page">
      <header className="site-header" style={{ position: "absolute" }}>
        <button className="brand" onClick={() => router.push("/")} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <span className="brand-mark">←</span>
          <span className="brand-name">{language === "pt" ? "Voltar" : "Back"}</span>
        </button>

        <div className="header-actions">
          <div className="language-switch">
            <button className={language === "pt" ? "active" : ""} onClick={() => changeLanguage("pt")}>PT</button>
            <button className={language === "en" ? "active" : ""} onClick={() => changeLanguage("en")}>EN</button>
          </div>
          <button className="theme-toggle" type="button" onClick={toggleTheme}>
            <span className="theme-icon" aria-hidden="true">{theme === "dark" ? "☾" : "☼"}</span>
            <span className="theme-label">{theme === "dark" ? "Dark" : "Light"}</span>
          </button>
          <button
            className="menu-toggle"
            style={{ display: "none" }}
            type="button"
          >
            <span /><span />
          </button>
        </div>
      </header>

      <article id="conteudo">
        {/* Camada 1: Visão rápida */}
        <section className="hero case-hero" style={{ paddingBottom: "var(--space-16)" }}>
          <div className="hero-glow" aria-hidden="true" />
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-content">
            <div className="hero-copy" style={{ maxWidth: "1000px" }}>
              <div className="availability"><span className="availability-dot" />{caseData.category[language]}</div>
              <h1 style={{ fontSize: "clamp(2rem, 4vw, 4rem)", letterSpacing: "-.04em", marginBottom: "24px" }}>
                {caseData.title[language]}
              </h1>
              <p className="hero-description">{caseData.summary[language]}</p>
              
              <div style={{ display: "flex", gap: "24px", marginTop: "32px", flexWrap: "wrap" }}>
                <div className="case-metric" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <strong style={{ fontSize: "2rem", color: "var(--accent)" }}>{caseData.metric}</strong>
                  <span style={{ color: "var(--muted)", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.1em", fontWeight: 700 }}>{caseData.metricLabel[language]}</span>
                </div>
                <div className="case-metric" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <strong style={{ fontSize: "1.25rem", color: "var(--text)", marginTop: "10px" }}>Role</strong>
                  <span style={{ color: "var(--muted)", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.1em", fontWeight: 700 }}>{caseData.role[language]}</span>
                </div>
              </div>

              <div className="tags" style={{ marginTop: "40px" }}>
                {caseData.coreTech.map(tech => <span key={tech}>{tech}</span>)}
              </div>
            </div>
          </div>
        </section>

        {/* Camada 2: Resumo Executivo */}
        <section className="section" style={{ paddingTop: "0" }}>
          <div className="section-heading reveal">
            <div>
              <p className="eyebrow">{language === "pt" ? "Resumo Executivo" : "Executive Summary"}</p>
              <h2>{language === "pt" ? "Contexto & Solução" : "Context & Solution"}</h2>
            </div>
          </div>
          <div className="expertise-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
            <div className="detail-card spotlight-card reveal">
              <div className="spotlight-overlay" />
              <h3>{language === "pt" ? "O Problema" : "The Problem"}</h3>
              <p style={{ marginBottom: "16px", color: "var(--muted-strong)" }}>{caseData.context[language]}</p>
              <p>{caseData.problem[language]}</p>
              <h4 style={{ marginTop: "24px", color: "var(--accent)" }}>{language === "pt" ? "Objetivo" : "Objective"}</h4>
              <p>{caseData.objective[language]}</p>
            </div>
            <div className="detail-card spotlight-card reveal">
              <div className="spotlight-overlay" />
              <h3>{language === "pt" ? "A Solução" : "The Solution"}</h3>
              <p>{caseData.solution[language]}</p>
              <h4 style={{ marginTop: "24px", color: "var(--accent)" }}>{language === "pt" ? "Diferencial Técnico" : "Technical Differentiator"}</h4>
              <p>{caseData.differentiator[language]}</p>
              <h4 style={{ marginTop: "24px", color: "var(--accent)" }}>{language === "pt" ? "Resultado" : "Result"}</h4>
              <p>{caseData.result[language]}</p>
            </div>
          </div>
        </section>

        {/* Camada 3: Estudo Técnico */}
        <section className="section">
          <div className="section-heading reveal">
            <div>
              <p className="eyebrow">{language === "pt" ? "Aprofundamento" : "Deep Dive"}</p>
              <h2>{language === "pt" ? "Arquitetura & Trade-offs" : "Architecture & Trade-offs"}</h2>
            </div>
          </div>
          
          <div className="detail-card spotlight-card reveal" style={{ marginBottom: "32px" }}>
            <div className="spotlight-overlay" />
            <h3 style={{ marginBottom: "16px" }}>{language === "pt" ? "Design de Arquitetura" : "Architecture Design"}</h3>
            <div style={{ background: "var(--bg)", padding: "24px", borderRadius: "8px", border: "1px solid var(--line-strong)", fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--muted-strong)", marginBottom: "24px", overflowX: "auto" }}>
              <code>{caseData.architecture[language]}</code>
            </div>
            <p><strong>{language === "pt" ? "Fluxo de Dados: " : "Data Flow: "}</strong> {caseData.dataFlow[language]}</p>
          </div>

          <div className="expertise-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
            <div className="detail-card spotlight-card reveal">
              <div className="spotlight-overlay" />
              <h3>{language === "pt" ? "Decisões Técnicas" : "Technical Decisions"}</h3>
              <ul style={{ paddingLeft: "20px", marginTop: "16px", color: "var(--text)" }}>
                {caseData.decisions[language].map((dec, i) => (
                  <li key={i} style={{ marginBottom: "12px" }}>{dec}</li>
                ))}
              </ul>
            </div>
            <div className="detail-card spotlight-card reveal">
              <div className="spotlight-overlay" />
              <h3>{language === "pt" ? "Trade-offs" : "Trade-offs"}</h3>
              <ul style={{ paddingLeft: "20px", marginTop: "16px", color: "var(--text)" }}>
                {caseData.tradeOffs[language].map((trade, i) => (
                  <li key={i} style={{ marginBottom: "12px" }}>{trade}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="detail-card spotlight-card reveal" style={{ marginTop: "32px" }}>
            <div className="spotlight-overlay" />
            <h3>{language === "pt" ? "Impacto Final & Futuro" : "Final Impact & Future"}</h3>
            <p style={{ marginTop: "16px" }}>{caseData.impact[language]}</p>
            <h4 style={{ marginTop: "24px", color: "var(--accent)" }}>{language === "pt" ? "Melhorias Futuras" : "Future Improvements"}</h4>
            <p>{caseData.future[language]}</p>
          </div>
        </section>

        <section className="contact-section" style={{ padding: "100px 0 50px" }}>
          <div className="contact-content reveal" style={{ textAlign: "center", display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <MagneticButton>
              <a className="button button-primary" href="mailto:matheusv.inagaki@gmail.com">
                {language === "pt" ? "Conversar sobre oportunidade" : "Discuss an opportunity"}
                <span aria-hidden="true">↗</span>
              </a>
            </MagneticButton>
            <MagneticButton>
              <button className="button button-light" onClick={() => router.push("/")}>
                {language === "pt" ? "Voltar ao Portfólio" : "Back to Portfolio"}
                <span aria-hidden="true">↑</span>
              </button>
            </MagneticButton>
          </div>
        </section>
      </article>

      <footer>
        <div className="footer-brand"><span className="brand-mark">MI</span><span>© {new Date().getFullYear()} Matheus Inagaki</span></div>
        <p>{language === "pt" ? "Projetado e construído com intenção." : "Designed and built with intention."}</p>
      </footer>
    </main>
  );
}
