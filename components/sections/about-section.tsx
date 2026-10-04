"use client";

import { type Language, homeContent } from "@/data/home";

interface AboutSectionProps {
  language: Language;
}

export function AboutSection({ language }: AboutSectionProps) {
  const t = homeContent[language];

  return (
    <section className="section about-section" id="sobre">
      <div className="about-intro reveal">
        <p className="eyebrow">{t.aboutEyebrow}</p>
        <h2>{t.aboutTitle}</h2>
        <p>{t.aboutCopy}</p>
      </div>
      <div className="about-grid">
        <article className="about-card recognition-card reveal">
          <p className="card-label">{t.recognitionLabel}</p>
          <div className="award-mark" aria-hidden="true">✦</div>
          <h3>{t.recognitionTitle}</h3><p>{t.recognitionCopy}</p>
        </article>
        <article className="about-card reveal">
          <p className="card-label">{t.languagesLabel}</p>
          <div className="language-list">
            {t.languages.map(([name, level]) => <div key={name}><strong>{name}</strong><span>{level}</span></div>)}
          </div>
        </article>
        <article className="about-card education-card reveal">
          <p className="card-label">{t.educationLabel}</p>
          <div className="education-year">JUN 2027</div>
          <h3>{t.educationTitle}</h3><p>{t.educationCopy}</p>
        </article>
      </div>
    </section>
  );
}
