"use client";

import { useEffect, useState } from "react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ChatDrawer } from "@/components/ui/chat-drawer";
import { useDecrypt } from "@/hooks/use-decrypt";
import { motion, Variants } from "framer-motion";

type Language = "pt" | "en";
type Theme = "light" | "dark";

const content = {
  pt: {
    nav: [
      ["Impacto", "#impacto"],
      ["Experiência", "#experiencia"],
      ["Expertise", "#expertise"],
      ["Sobre", "#sobre"],
    ],
    resume: "Baixar CV",
    available: "STATUS / disponível para sistemas difíceis",
    role: "AI SYSTEMS ENGINEER · GENAI · RAG · AGENTS",
    heroLine1: "IA que entende contexto.",
    heroLine2: "Engenharia que aguenta escala.",
    heroLine3: "Produto que move o negócio.",
    heroCopy:
      "Transformo regras de negócio complexas em sistemas de IA Generativa seguros, escaláveis e prontos para produção — de agentes autônomos e RAG a LLMs open-source com inferência privada.",
    contact: "Vamos conversar",
    explore: "Explorar trabalho",
    scroll: "Role para explorar",
    system: "AI SYSTEMS / PRODUCTION",
    systemStatus: "Todos os sistemas operacionais",
    systemItems: [
      ["RAG PIPELINE", "Context-aware"],
      ["MULTI-AGENT", "Orchestrated"],
      ["LOCAL LLM", "Private inference"],
    ],
    stats: [
      ["5+", "anos construindo soluções de IA"],
      ["40%", "menos tempo em processamento documental"],
      ["92%", "de acurácia em classificação de tickets"],
      ["20M+", "tickets processados em escala"],
    ],
    impactEyebrow: "Dossiês de produção",
    impactTitle: "Três sistemas. Três problemas que não cabiam em uma demo.",
    impactCopy:
      "Projetos desenhados na interseção entre pesquisa aplicada, engenharia de software e resultado de negócio.",
    github: "Explorar GitHub",
    cases: [
      {
        index: "01",
        metric: "−40%",
        metricLabel: "tempo de processamento",
        title: "RAG jurídico para documentos complexos",
        description:
          "Sistema de recuperação e geração desenvolvido com especialistas do domínio para compreender jargões legais e acelerar fluxos documentais do TJRS.",
        tags: ["RAG", "LangChain", "Azure", "NLP"],
      },
      {
        index: "02",
        metric: "92%",
        metricLabel: "acurácia em produção",
        title: "ML distribuído para 20M+ tickets",
        description:
          "Classificador SVM integrado a pipelines Apache Spark e Delta Live Tables, eliminando triagem manual e alimentando BI com dados confiáveis.",
        tags: ["Python", "SVM", "Apache Spark", "Delta"],
      },
      {
        index: "03",
        metric: "Private",
        metricLabel: "IA corporativa segura",
        title: "LLMs open-source em ambiente privado",
        description:
          "Pipelines de inferência local que substituem APIs proprietárias, reduzem custo operacional e preservam dados sensíveis dentro da infraestrutura corporativa.",
        tags: ["Llama", "Fine-tuning", "Local LLM", "Docker"],
      },
    ],
    experienceEyebrow: "Trajetória",
    experienceTitle: "Um histórico de versões, não uma lista de cargos.",
    current: "Atual",
    experiences: [
      {
        period: "2025 — Atual",
        company: "Pesquisa aplicada & Freelance",
        role: "Pesquisador de IA Open-Source",
        copy: "Fine-tuning de LLMs em bases clínicas públicas, pipelines multiagentes com Gemini, Claude e Llama, automações com n8n e deploy no Hugging Face.",
        tags: ["Open-source LLMs", "Multi-agent", "Fine-tuning"],
      },
      {
        period: "2023 — 2025",
        company: "Grupo Stefanini",
        role: "AI Research Scientist",
        copy: "Promoção interna para liderar iniciativas de IA Generativa, RAG, NLP e Visão Computacional, com APIs RESTful e aplicações containerizadas no Azure.",
        tags: ["GenAI", "RAG", "Azure"],
      },
      {
        period: "2021 — 2023",
        company: "Grupo Stefanini · North America & APAC",
        role: "Data Scientist II",
        copy: "Modelos de ML e pipelines de dados distribuídos para operações globais, infraestrutura Linux de baixa latência e ingestão automatizada em Data Lakes.",
        tags: ["Machine Learning", "Big Data", "MLOps"],
      },
      {
        period: "2021 — 2022",
        company: "Instituto Butantan",
        role: "Data Scientist · Consultoria",
        copy: "Modelagem clínica preditiva para risco de SARS-CoV-2, com XGBoost, Random Forest, redes neurais e rigor estatístico em dados sensíveis.",
        tags: ["Health AI", "XGBoost", "Statistics"],
      },
    ],
    expertiseEyebrow: "Expertise",
    expertiseTitle: "Meu mapa de decisão técnica.",
    expertiseCopy:
      "Uma stack construída para levar IA da prova de conceito à operação, com atenção a custo, privacidade, qualidade e escala.",
    expertise: [
      {
        number: "01",
        title: "Generative AI",
        copy: "RAG, agentes autônomos, fine-tuning, prompt engineering e avaliação de LLMs open-source.",
        items: ["LangChain", "Llama", "Gemini", "Claude", "ChromaDB", "Pinecone"],
      },
      {
        number: "02",
        title: "ML & Vision",
        copy: "Modelos preditivos, NLP, visão computacional e desenho de experimentos com rigor estatístico.",
        items: ["PyTorch", "Scikit-learn", "OpenCV", "XGBoost", "SVM", "PCA / SMOTE"],
      },
      {
        number: "03",
        title: "Cloud & Data",
        copy: "Infraestrutura escalável, pipelines distribuídos e deploy seguro em ambientes corporativos.",
        items: ["Microsoft Azure", "Docker", "Linux", "Apache Spark", "SQL Server", "Data Lakes"],
      },
      {
        number: "04",
        title: "Software Engineering",
        copy: "APIs robustas e código sustentável para transformar pesquisa em produto confiável.",
        items: ["Python", "FastAPI", "REST", "OpenAPI", "OOP", "Clean Code"],
      },
    ],
    aboutEyebrow: "Além do código",
    aboutTitle: "Precisão japonesa. Ritmo global. Engenharia aplicada.",
    aboutCopy:
      "Minha trajetória combina pesquisa aplicada, execução hands-on e comunicação entre tecnologia e negócio. A vivência no Japão e a atuação com times de North America & APAC moldaram uma forma de trabalhar precisa, adaptável e multicultural.",
    recognitionLabel: "Reconhecimento",
    recognitionTitle: "Finalista regional · América Latina",
    recognitionCopy:
      "NASA Space Apps Challenge & IBM Call for Code — liderança de engenharia de IA no projeto SpecWater, 2021.",
    languagesLabel: "Idiomas",
    languages: [
      ["Português", "Nativo"],
      ["Inglês", "Fluente"],
      ["Japonês", "Intermediário superior"],
    ],
    educationLabel: "Formação",
    educationTitle: "Ciência da Computação",
    educationCopy: "Universidade Anhembi Morumbi · conclusão prevista para junho de 2027",
    ctaEyebrow: "Pronto para o próximo desafio",
    ctaTitle: "Tem um problema difícil? Melhor ainda.",
    ctaCopy:
      "Estou aberto a conversar sobre produtos de IA, sistemas generativos e problemas complexos que pedem engenharia de verdade.",
    email: "Enviar um e-mail",
    linkedin: "Conectar no LinkedIn",
    footer: "Projetado e construído com intenção.",
    backTop: "Voltar ao topo",
  },
  en: {
    nav: [
      ["Impact", "#impacto"],
      ["Experience", "#experiencia"],
      ["Expertise", "#expertise"],
      ["About", "#sobre"],
    ],
    resume: "Download résumé",
    available: "STATUS / available for hard systems",
    role: "AI SYSTEMS ENGINEER · GENAI · RAG · AGENTS",
    heroLine1: "AI that understands context.",
    heroLine2: "Engineering that holds at scale.",
    heroLine3: "Products that move the business.",
    heroCopy:
      "I turn complex business rules into secure, scalable, production-ready Generative AI systems — from autonomous agents and RAG to open-source LLMs with private inference.",
    contact: "Let's talk",
    explore: "Explore my work",
    scroll: "Scroll to explore",
    system: "AI SYSTEMS / PRODUCTION",
    systemStatus: "All systems operational",
    systemItems: [
      ["RAG PIPELINE", "Context-aware"],
      ["MULTI-AGENT", "Orchestrated"],
      ["LOCAL LLM", "Private inference"],
    ],
    stats: [
      ["5+", "years building AI solutions"],
      ["40%", "faster document processing"],
      ["92%", "accuracy in ticket classification"],
      ["20M+", "tickets processed at scale"],
    ],
    impactEyebrow: "Production dossiers",
    impactTitle: "Three systems. Three problems too real for a demo.",
    impactCopy:
      "Work designed at the intersection of applied research, software engineering, and measurable business outcomes.",
    github: "Explore GitHub",
    cases: [
      {
        index: "01",
        metric: "−40%",
        metricLabel: "processing time",
        title: "Legal RAG for complex documents",
        description:
          "A retrieval and generation system built with domain experts to understand legal terminology and accelerate document workflows at TJRS.",
        tags: ["RAG", "LangChain", "Azure", "NLP"],
      },
      {
        index: "02",
        metric: "92%",
        metricLabel: "production accuracy",
        title: "Distributed ML for 20M+ tickets",
        description:
          "An SVM classifier integrated with Apache Spark and Delta Live Tables, removing manual triage and feeding reliable data into BI.",
        tags: ["Python", "SVM", "Apache Spark", "Delta"],
      },
      {
        index: "03",
        metric: "Private",
        metricLabel: "secure enterprise AI",
        title: "Open-source LLMs in private environments",
        description:
          "Local inference pipelines replacing proprietary APIs to reduce operating costs and keep sensitive data inside corporate infrastructure.",
        tags: ["Llama", "Fine-tuning", "Local LLM", "Docker"],
      },
    ],
    experienceEyebrow: "Career",
    experienceTitle: "A version history, not a list of titles.",
    current: "Current",
    experiences: [
      {
        period: "2025 — Present",
        company: "Applied Research & Freelance",
        role: "Open-Source AI Researcher",
        copy: "LLM fine-tuning on public clinical datasets, multi-agent pipelines with Gemini, Claude and Llama, n8n automations, and Hugging Face deployment.",
        tags: ["Open-source LLMs", "Multi-agent", "Fine-tuning"],
      },
      {
        period: "2023 — 2025",
        company: "Stefanini Group",
        role: "AI Research Scientist",
        copy: "Promoted internally to lead Generative AI, RAG, NLP and Computer Vision initiatives, delivering RESTful APIs and containerized applications on Azure.",
        tags: ["GenAI", "RAG", "Azure"],
      },
      {
        period: "2021 — 2023",
        company: "Stefanini Group · North America & APAC",
        role: "Data Scientist II",
        copy: "ML models and distributed data pipelines for global operations, low-latency Linux infrastructure and automated Data Lake ingestion.",
        tags: ["Machine Learning", "Big Data", "MLOps"],
      },
      {
        period: "2021 — 2022",
        company: "Butantan Institute",
        role: "Data Scientist · Consultant",
        copy: "Predictive clinical modeling for SARS-CoV-2 risk using XGBoost, Random Forest, neural networks and rigorous statistics for sensitive data.",
        tags: ["Health AI", "XGBoost", "Statistics"],
      },
    ],
    expertiseEyebrow: "Expertise",
    expertiseTitle: "My technical decision map.",
    expertiseCopy:
      "A stack built to take AI from proof of concept to production — balancing cost, privacy, quality, and scale.",
    expertise: [
      {
        number: "01",
        title: "Generative AI",
        copy: "RAG, autonomous agents, fine-tuning, prompt engineering and open-source LLM evaluation.",
        items: ["LangChain", "Llama", "Gemini", "Claude", "ChromaDB", "Pinecone"],
      },
      {
        number: "02",
        title: "ML & Vision",
        copy: "Predictive models, NLP, computer vision and statistically rigorous experiment design.",
        items: ["PyTorch", "Scikit-learn", "OpenCV", "XGBoost", "SVM", "PCA / SMOTE"],
      },
      {
        number: "03",
        title: "Cloud & Data",
        copy: "Scalable infrastructure, distributed pipelines and secure deployment in enterprise environments.",
        items: ["Microsoft Azure", "Docker", "Linux", "Apache Spark", "SQL Server", "Data Lakes"],
      },
      {
        number: "04",
        title: "Software Engineering",
        copy: "Robust APIs and maintainable code that turn research into dependable products.",
        items: ["Python", "FastAPI", "REST", "OpenAPI", "OOP", "Clean Code"],
      },
    ],
    aboutEyebrow: "Beyond code",
    aboutTitle: "Japanese precision. Global rhythm. Applied engineering.",
    aboutCopy:
      "My path combines applied research, hands-on execution, and communication across technology and business. Living in Japan and working with North America & APAC teams shaped a precise, adaptable, multicultural way of building.",
    recognitionLabel: "Recognition",
    recognitionTitle: "Regional finalist · Latin America",
    recognitionCopy:
      "NASA Space Apps Challenge & IBM Call for Code — AI engineering lead for the SpecWater project, 2021.",
    languagesLabel: "Languages",
    languages: [
      ["Portuguese", "Native"],
      ["English", "Fluent"],
      ["Japanese", "Upper intermediate"],
    ],
    educationLabel: "Education",
    educationTitle: "B.Sc. in Computer Science",
    educationCopy: "Universidade Anhembi Morumbi · expected graduation in June 2027",
    ctaEyebrow: "Ready for the next challenge",
    ctaTitle: "Got a hard problem? Even better.",
    ctaCopy:
      "I'm open to conversations about AI products, generative systems, and complex problems that demand thoughtful engineering.",
    email: "Send an email",
    linkedin: "Connect on LinkedIn",
    footer: "Designed and built with intention.",
    backTop: "Back to top",
  },
} as const;


const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};
const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } }
};

export default function Home() {
  const [language, setLanguage] = useState<Language>("pt");

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll('.spotlight-card');
      cards.forEach((card) => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
        (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
      });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const [theme, setTheme] = useState<Theme>("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopRailOpen, setDesktopRailOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(0);
  const t = content[language];
  const decryptedLine1 = useDecrypt(t.heroLine1, 35, 100);
  const decryptedLine2 = useDecrypt(t.heroLine2, 35, 400);
  const decryptedLine3 = useDecrypt(t.heroLine3, 35, 700);

  useEffect(() => {
    document.documentElement.lang = language === "pt" ? "pt-BR" : "en";
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

  return (
    <main id="top" className={desktopRailOpen ? "rail-open" : "rail-collapsed"}>
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
            <a key={href} href={href}>{label}</a>
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
            <a href="mailto:matheusinagakimoraes97@gmail.com" onClick={() => setMenuOpen(false)}>{t.contact}<span aria-hidden="true">↗</span></a>
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
              <h1 id="hero-title">
                <span>{decryptedLine1}</span>
                <span>{decryptedLine2}</span>
                <span className="accent-line">{decryptedLine3}</span>
              </h1>
              <p className="hero-description">{t.heroCopy}</p>
              <div className="hero-actions">
                <MagneticButton><a className="button button-primary" href="mailto:matheusinagakimoraes97@gmail.com">
                  {t.contact}<span aria-hidden="true">↗</span>
                </a></MagneticButton>
                <MagneticButton><a className="button button-secondary" href="#impacto">
                  {t.explore}<span aria-hidden="true">↓</span>
                </a></MagneticButton>
              </div>
            </div>

            <div className="system-card" aria-label={language === "pt" ? "Painel visual de sistemas de IA" : "AI systems visual panel"}>
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

        <section className="section impact-section" id="impacto">
          <div className="section-heading reveal">
            <div>
              <p className="eyebrow">{t.impactEyebrow}</p>
              <h2>{t.impactTitle}</h2>
            </div>
            <div className="section-heading-side">
              <p>{t.impactCopy}</p>
              <a className="text-link" href="https://github.com/mtsvi-moraes" target="_blank" rel="noreferrer">{t.github}<span aria-hidden="true">↗</span></a>
            </div>
          </div>

          <motion.div className="case-list" variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {t.cases.map((item) => (
              <motion.article variants={fadeUpItem} className="case-card spotlight-card reveal" key={item.index}>
                <div className="spotlight-overlay" /><div className="case-index">/{item.index}</div>
                <div className="case-main">
                  <div className="case-metric"><strong>{item.metric}</strong><span>{item.metricLabel}</span></div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className="tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                </div>
                <span className="case-arrow" aria-hidden="true">↗</span>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section className="section experience-section" id="experiencia">
          <div className="section-heading reveal">
            <div>
              <p className="eyebrow">{t.experienceEyebrow}</p>
              <h2>{t.experienceTitle}</h2>
            </div>
          </div>
          <div className="timeline" role="list">
            {t.experiences.map((item, index) => (
              <article className={`timeline-item reveal ${selectedExperience === index ? "selected" : ""}`} key={`${item.company}-${item.role}`} role="listitem">
                <button
                  className="timeline-hit-area"
                  type="button"
                  onClick={() => setSelectedExperience(index)}
                  aria-pressed={selectedExperience === index}
                  aria-label={language === "pt" ? `Selecionar experiência: ${item.role}` : `Select experience: ${item.role}`}
                />
                <div className="timeline-rail"><span className={selectedExperience === index ? "active" : ""} /></div>
                <div className="timeline-period">{item.period}{index === 0 && <em>{t.current}</em>}</div>
                <div className="timeline-content">
                  <p>{item.company}</p><h3>{item.role}</h3><div>{item.copy}</div>
                  <div className="tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section expertise-section" id="expertise">
          <div className="section-heading reveal">
            <div><p className="eyebrow">{t.expertiseEyebrow}</p><h2>{t.expertiseTitle}</h2></div>
            <div className="section-heading-side"><p>{t.expertiseCopy}</p></div>
          </div>
          <motion.div className="expertise-grid" variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {t.expertise.map((item) => (
              <motion.article variants={fadeUpItem} className="expertise-card spotlight-card reveal" key={item.number}>
                <div className="spotlight-overlay" /><div className="expertise-number">{item.number}</div>
                <h3>{item.title}</h3><p>{item.copy}</p>
                <div className="skill-list">{item.items.map((skill) => <span key={skill}>{skill}</span>)}</div>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section className="section about-section" id="sobre">
          <div className="about-intro reveal">
            <p className="eyebrow">{t.aboutEyebrow}</p>
            <h2>{t.aboutTitle}</h2>
            <p>{t.aboutCopy}</p>
          </div>
          <motion.div className="about-grid" variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            <motion.article variants={fadeUpItem} className="about-card spotlight-card recognition-card reveal">
              <div className="spotlight-overlay" /><p className="card-label">{t.recognitionLabel}</p>
              <div className="award-mark" aria-hidden="true">✦</div>
              <h3>{t.recognitionTitle}</h3><p>{t.recognitionCopy}</p>
            </motion.article>
            <motion.article variants={fadeUpItem} className="about-card spotlight-card reveal">
              <div className="spotlight-overlay" /><p className="card-label">{t.languagesLabel}</p>
              <div className="language-list">
                {t.languages.map(([name, level]) => <div key={name}><strong>{name}</strong><span>{level}</span></div>)}
              </div>
            </motion.article>
            <motion.article variants={fadeUpItem} className="about-card spotlight-card education-card reveal">
              <div className="spotlight-overlay" /><p className="card-label">{t.educationLabel}</p>
              <div className="education-year">JUN 2027</div>
              <h3>{t.educationTitle}</h3><p>{t.educationCopy}</p>
            </motion.article>
          </motion.div>
        </section>

        <section className="contact-section" id="contato">
          <div className="contact-orb" aria-hidden="true" />
          <div className="contact-content reveal">
            <p className="eyebrow">{t.ctaEyebrow}</p>
            <h2>{t.ctaTitle}</h2><p>{t.ctaCopy}</p>
            <div className="contact-actions">
              <a className="button button-light" href="mailto:matheusinagakimoraes97@gmail.com">{t.email}<span aria-hidden="true">↗</span></a>
              <a className="button button-outline" href="https://linkedin.com/in/mvinagaki" target="_blank" rel="noreferrer">{t.linkedin}<span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </section>
      </div>

      <footer>
        <div className="footer-brand"><span className="brand-mark">MI</span><span>© {new Date().getFullYear()} Matheus Inagaki</span></div>
        <p>{t.footer}</p>
        <div className="footer-links">
          <a href="https://github.com/mtsvi-moraes" target="_blank" rel="noreferrer">GitHub ↗</a>
          <a href="https://linkedin.com/in/mvinagaki" target="_blank" rel="noreferrer">LinkedIn ↗</a>
          <a href="#top">{t.backTop} ↑</a>
        </div>
      </footer>
      <ChatDrawer />
    </main>
  );
}
