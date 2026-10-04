"use client";

import Link from "next/link";
import { type Language, homeContent } from "@/data/home";

interface CasesSectionProps {
  language: Language;
}

export function CasesSection({ language }: CasesSectionProps) {
  const t = homeContent[language];

  return (
    <section className="section impact-section" id="impacto">
      <div className="section-heading reveal">
        <div>
          <p className="eyebrow">{t.impactEyebrow}</p>
          <h2>{t.impactTitle}</h2>
        </div>
        <div className="section-heading-side">
          <p>{t.impactCopy}</p>
          <a className="text-link" href="https://github.com/matheusinagaki" target="_blank" rel="noreferrer">{t.github}<span aria-hidden="true">↗</span></a>
        </div>
      </div>

      <div className="case-list">
        {t.cases.map((item) => (
          <Link key={item.index} href={`/case/${item.slug}`} passHref legacyBehavior>
            <a className="case-card reveal" style={{ textDecoration: "none", color: "inherit", cursor: "pointer", display: "block" }}>
              <div className="case-index">/{item.index}</div>
              <div className="case-main">
                <div className="case-metric"><strong>{item.metric}</strong><span>{item.metricLabel}</span></div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              </div>
              <span className="case-arrow" aria-hidden="true">↗</span>
            </a>
          </Link>
        ))}
      </div>
    </section>
  );
}
