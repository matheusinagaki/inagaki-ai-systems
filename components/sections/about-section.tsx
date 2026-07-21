"use client";

import { motion } from "framer-motion";
import { type Language, homeContent } from "@/data/home";
import { staggerContainer, fadeUpItem } from "@/lib/animations";

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
  );
}
