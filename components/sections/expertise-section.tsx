"use client";

import { motion } from "framer-motion";
import { type Language, homeContent } from "@/data/home";
import { staggerContainer, fadeUpItem } from "@/lib/animations";

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
  );
}
