"use client";

import { useState, type CSSProperties } from "react";
import { ArrowRight, Info } from "lucide-react";
import type { CaseStudy, Language } from "@/data/cases";

const labels = {
  pt: {
    context: "Contexto profissional",
    team: "Atuação em equipe",
    contribution: "Minha contribuição",
    title: "Uma leitura do sistema.",
    select: "Selecione uma etapa",
    stages: "Etapas da arquitetura conceitual",
    note: "Visão conceitual simplificada para apresentação pública. Detalhes internos omitidos.",
    flow: "Fluxo de dados",
  },
  en: {
    context: "Professional context",
    team: "Team contribution",
    contribution: "My contribution",
    title: "A closer look at the system.",
    select: "Select a stage",
    stages: "Conceptual architecture stages",
    note: "Simplified conceptual view for public presentation. Internal details omitted.",
    flow: "Data flow",
  },
};

export function CaseArchitecture({ caseStudy, language }: { caseStudy: CaseStudy; language: Language }) {
  const [selectedStageId, setSelectedStageId] = useState(caseStudy.architectureStages[0]?.id);
  const selectedIndex = Math.max(0, caseStudy.architectureStages.findIndex((stage) => stage.id === selectedStageId));
  const selectedStage = caseStudy.architectureStages[selectedIndex];
  const t = labels[language];
  const detailId = `architecture-detail-${caseStudy.slug}`;
  const titleId = `architecture-title-${caseStudy.slug}`;

  return (
    <figure className="case-architecture" aria-labelledby={titleId}>
      <figcaption>
        <div className="architecture-credits">
          <div>
            <span className="architecture-label">{t.context}</span>
            <strong>{caseStudy.professionalContext}</strong>
            <span className="architecture-team">{t.team}</span>
          </div>
          <div>
            <span className="architecture-label">{t.contribution}</span>
            <strong>{caseStudy.role[language]}</strong>
          </div>
        </div>

        <div className="architecture-heading">
          <h3 id={titleId}>{t.title}</h3>
          <span>{t.select}<ArrowRight size={14} aria-hidden="true" /></span>
        </div>
      </figcaption>

      <p className="sr-only">{caseStudy.architecture[language]}</p>
      <div className="architecture-canvas">
        <ol
          className="architecture-flow"
          aria-label={t.stages}
          style={{ "--architecture-stages": caseStudy.architectureStages.length } as CSSProperties}
        >
          {caseStudy.architectureStages.map((stage, index) => (
            <li key={stage.id}>
              <button
                type="button"
                className="architecture-node"
                aria-pressed={stage.id === selectedStage?.id}
                aria-controls={detailId}
                onClick={() => setSelectedStageId(stage.id)}
              >
                <span className="architecture-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <strong>{stage.title[language]}</strong>
                <span className="architecture-technology">{stage.technology}</span>
              </button>
              {index < caseStudy.architectureStages.length - 1 && <ArrowRight className="architecture-connector" size={16} aria-hidden="true" />}
            </li>
          ))}
        </ol>
        <div className="architecture-detail" id={detailId} aria-live="polite" aria-atomic="true">
          {selectedStage && <>
            <span className="architecture-detail-label">{String(selectedIndex + 1).padStart(2, "0")} / {selectedStage.title[language]}</span>
            <p>{selectedStage.description[language]}</p>
          </>}
        </div>
      </div>

      <p className="architecture-note"><Info size={14} aria-hidden="true" /><span>{t.note}</span></p>
      <p className="architecture-data-flow"><strong>{t.flow}: </strong>{caseStudy.dataFlow[language]}</p>
    </figure>
  );
}
