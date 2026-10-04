"use client";

import { type Language, homeContent } from "@/data/home";

interface ExpertiseSectionProps {
  language: Language;
}

export function ExpertiseSection({ language }: ExpertiseSectionProps) {
  const t = homeContent[language];

  return (
    <section className="section expertise-section" id="expertise">
      <div className="section-heading reveal">
        <div><p className="eyebrow">{t.expertiseEyebrow}</p><h2>{t.expertiseTitle}</h2></div>
        <div className="section-heading-side"><p>{t.expertiseCopy}</p></div>
      </div>
      <div className="expertise-grid">
        {t.expertise.map((item) => (
          <article className="expertise-card reveal" key={item.number}>
            <div className="expertise-number">{item.number}</div>
            <h3>{item.title}</h3><p>{item.copy}</p>
            <div className="skill-list">{item.items.map((skill) => <span key={skill}>{skill}</span>)}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
