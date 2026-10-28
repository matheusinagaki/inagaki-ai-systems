const GRID_LINES = Array.from({ length: 6 }, (_, index) => index);
const LAYERS = [3, 2, 1, 0];

const artworkCodes: Record<string, string> = {
  "rag-juridico": "CONTEXT / RETRIEVAL",
  "ml-distribuido": "PARALLEL / INFERENCE",
  "llms-privados": "PRIVATE / COMPUTE",
};

export function CaseThumbnail({ slug, variant = "card" }: { slug: string; variant?: "card" | "hero" }) {
  if (!artworkCodes[slug]) return null;

  return (
    <div className={`case-thumbnail${variant === "hero" ? " case-thumbnail-hero" : ""}`} data-case-art={slug} aria-hidden="true">
      <svg className="case-thumbnail-art" viewBox="0 0 180 140" focusable="false">
        {GRID_LINES.map((index) => (
          <line key={index} x1="10" y1={16 + index * 18} x2="170" y2={16 + index * 18} className="thumbnail-grid" />
        ))}

        {slug === "rag-juridico" && <>
          {LAYERS.map((layer) => {
            const y = 22 + layer * 18;
            return (
              <g key={layer}>
                <polygon points={`90,${y} 148,${y + 22} 90,${y + 44} 32,${y + 22}`} className={layer === 0 ? "thumbnail-plane thumbnail-highlight" : "thumbnail-plane"} />
                {[0, 1, 2].map((index) => (
                  <line key={index} x1={59 + index * 8} y1={y + 22 + index * 3} x2={103 + index * 8} y2={y + 5 + index * 3} className="thumbnail-document-line" />
                ))}
              </g>
            );
          })}
          <polyline points="32,44 20,44 20,108 91,108 91,92" className="thumbnail-retrieval-path" />
          <rect x="87" y="88" width="8" height="8" className="thumbnail-node" />
        </>}

        {slug === "ml-distribuido" && <>
          {Array.from({ length: 7 }, (_, index) => {
            const y = 20 + index * 13;
            return (
              <g key={index}>
                <path d={`M12 ${y} H42 L68 ${y + (3 - index) * 4} H105 L132 60 H167`} className={index === 3 ? "thumbnail-lane thumbnail-highlight" : "thumbnail-lane"} />
                <rect x="39" y={y - 2} width="4" height="4" className="thumbnail-node" />
              </g>
            );
          })}
          <rect x="119" y="47" width="26" height="26" transform="rotate(45 132 60)" className="thumbnail-core" />
          <circle cx="132" cy="60" r="4" className="thumbnail-node" />
        </>}

        {slug === "llms-privados" && <>
          {[0, 1, 2, 3].map((index) => {
            const offset = index * 9;
            return (
              <polygon
                key={index}
                points={`90,${15 + offset} ${149 - offset / 2},${43 + offset} ${149 - offset / 2},${86 - offset / 2} 90,${113 - offset / 2} ${31 + offset / 2},${86 - offset / 2} ${31 + offset / 2},${43 + offset}`}
                className={index === 3 ? "thumbnail-plane thumbnail-highlight" : "thumbnail-plane"}
              />
            );
          })}
          <polygon points="90,52 115,64 90,76 65,64" className="thumbnail-core" />
          <line x1="90" y1="76" x2="90" y2="100" className="thumbnail-highlight" />
          <rect x="87" y="61" width="6" height="6" className="thumbnail-node" />
        </>}
      </svg>
      <span className="case-thumbnail-code">{artworkCodes[slug]}</span>
    </div>
  );
}
