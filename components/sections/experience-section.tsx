"use client";

import { useState } from "react";
import { type Language, homeContent } from "@/data/home";

interface ExperienceSectionProps {
  language: Language;
}

export function ExperienceSection({ language }: ExperienceSectionProps) {
  const [selectedExperience, setSelectedExperience] = useState(0);
  const t = homeContent[language];

  return (
    <section className="section experience-section" id="experiencia">
      <div className="section-heading reveal">
        <div>
          <p className="eyebrow">{t.experienceEyebrow}</p>
          <h2>{t.experienceTitle}</h2>
        </div>
      </div>
      <div className="timeline" role="list">
        {t.experiences.map((item, index) => (
          <article 
            className={`timeline-item reveal ${selectedExperience === index ? "selected" : ""}`} 
            key={`${item.company}-${item.role}`} 
            role="listitem"
          >
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
  );
}
