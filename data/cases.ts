export type Language = "pt" | "en";

export interface CaseStudy {
  slug: string;
  category: Record<Language, string>;
  title: Record<Language, string>;
  summary: Record<Language, string>;
  metric: string;
  metricLabel: Record<Language, string>;
  role: Record<Language, string>;
  coreTech: string[];

  // Camada 2: Resumo Executivo
  context: Record<Language, string>;
  problem: Record<Language, string>;
  objective: Record<Language, string>;
  solution: Record<Language, string>;
  result: Record<Language, string>;
  differentiator: Record<Language, string>;

  // Camada 3: Estudo Técnico
  architecture: Record<Language, string>;
  dataFlow: Record<Language, string>;
  decisions: Record<Language, string[]>;
  tradeOffs: Record<Language, string[]>;
  impact: Record<Language, string>;
  future: Record<Language, string>;
}

export const casesData: CaseStudy[] = [
  {
    slug: "rag-juridico",
    category: {
      pt: "Generative AI & RAG",
      en: "Generative AI & RAG"
    },
    title: {
      pt: "RAG jurídico para documentos complexos",
      en: "Legal RAG for complex documents"
    },
    summary: {
      pt: "Sistema de recuperação e geração (RAG) desenhado para o TJRS que decodifica jargões legais e acelera operações documentais.",
      en: "Retrieval and generation system (RAG) designed for TJRS that decodes legal jargon and accelerates document operations."
    },
    metric: "−40%",
    metricLabel: { pt: "tempo de processamento", en: "processing time" },
    role: { pt: "Líder de Arquitetura de IA", en: "Lead AI Architect" },
    coreTech: ["RAG", "LangChain", "Azure", "NLP"],

    // Camada 2
    context: {
      pt: "Fluxos documentais críticos do Tribunal de Justiça do Rio Grande do Sul (TJRS) lidam com altíssimo volume e densidade semântica.",
      en: "Critical document workflows at the Court of Justice of Rio Grande do Sul (TJRS) deal with extremely high volume and semantic density."
    },
    problem: {
      pt: "A análise manual era lenta devido à complexidade dos jargões legais, gargalando a operação.",
      en: "Manual analysis was slow due to the complexity of legal jargon, bottlenecking operations."
    },
    objective: {
      pt: "Reduzir o tempo de triagem e compreensão de peças jurídicas usando LLMs.",
      en: "Reduce the time for triage and comprehension of legal documents using LLMs."
    },
    solution: {
      pt: "Pipeline RAG integrado a especialistas do domínio para recuperar jurisprudência e gerar sínteses contextualizadas usando infraestrutura Azure.",
      en: "RAG pipeline integrated with domain experts to retrieve jurisprudence and generate contextualized summaries using Azure infrastructure."
    },
    result: {
      pt: "Redução direta de 40% no tempo de processamento documental em relação ao fluxo puramente manual anterior.",
      en: "Direct reduction of 40% in document processing time compared to the previous purely manual workflow."
    },
    differentiator: {
      pt: "Modelagem do retrieval específica para terminologia legal profunda, indo além de buscas vetoriais genéricas.",
      en: "Retrieval modeling specific to deep legal terminology, going beyond generic vector searches."
    },

    // Camada 3
    architecture: {
      pt: "Ingestão de PDFs via OCR (Azure Document Intelligence) → Chunking Semântico → ChromaDB → LangChain → LLM via Azure OpenAI.",
      en: "PDF Ingestion via OCR (Azure Document Intelligence) → Semantic Chunking → ChromaDB → LangChain → LLM via Azure OpenAI."
    },
    dataFlow: {
      pt: "Os documentos legais são digitalizados via OCR e vetorizados no ChromaDB. O LangChain orquestra a recuperação e o Azure OpenAI gera a síntese final embasada.",
      en: "Legal documents are digitized via OCR and vectorized in ChromaDB. LangChain orchestrates the retrieval and Azure OpenAI generates the grounded summary."
    },
    decisions: {
      pt: [
        "Uso de LangChain para orquestração modular.",
        "Hospedagem no ambiente Azure por conformidade de segurança governamental."
      ],
      en: [
        "Use of LangChain for modular orchestration.",
        "Hosting in Azure environment for government security compliance."
      ]
    },
    tradeOffs: {
      pt: [
        "Optamos por RAG ao invés de Fine-Tuning para manter o conhecimento jurídico atualizável e evitar o alto custo de retreinamento de LLMs.",
        "Para garantir que os dados não subissem para APIs públicas, trocamos latência por custo e segurança operando modelos em nuvem privada corporativa."
      ],
      en: [
        "Opted for RAG instead of Fine-Tuning to keep legal knowledge updatable and avoid the high cost of LLM retraining.",
        "To ensure data wouldn't be exposed to public APIs, we traded latency for cost and security by operating models within a private corporate cloud."
      ]
    },
    impact: {
      pt: "Aceleração operacional de uma das cortes de justiça mais movimentadas do país, impactando diretamente o andamento de processos.",
      en: "Operational acceleration of one of the busiest justice courts in the country, directly impacting the progress of lawsuits."
    },
    future: {
      pt: "Evolução do sistema RAG para uma arquitetura de Agentes Autônomos multimodais, permitindo a ingestão e interpretação de evidências visuais e escaneamentos não textuais anexados aos processos.",
      en: "Evolution of the RAG system into a multimodal Autonomous Agents architecture, allowing the ingestion and interpretation of visual evidence and non-textual scans attached to lawsuits."
    }
  },
  {
    slug: "ml-distribuido",
    category: {
      pt: "Machine Learning & Big Data",
      en: "Machine Learning & Big Data"
    },
    title: {
      pt: "ML distribuído para 20M+ tickets",
      en: "Distributed ML for 20M+ tickets"
    },
    summary: {
      pt: "Classificador escalável rodando sobre Apache Spark que eliminou a triagem humana e escalou a alimentação de BI.",
      en: "Scalable classifier running on Apache Spark that eliminated human triage and scaled BI feeding."
    },
    metric: "92%",
    metricLabel: { pt: "acurácia em produção", en: "production accuracy" },
    role: { pt: "Data Scientist & Data Engineer", en: "Data Scientist & Data Engineer" },
    coreTech: ["Python", "SVM", "Apache Spark", "Delta Live Tables"],

    // Camada 2
    context: {
      pt: "Operação global lidando com mais de 20 milhões de tickets operacionais.",
      en: "Global operation dealing with more than 20 million operational tickets."
    },
    problem: {
      pt: "A triagem manual era incapaz de acompanhar o volume de dados, gerando gargalos e atrasando os painéis de Business Intelligence.",
      en: "Manual triage was unable to keep up with data volume, generating bottlenecks and delaying Business Intelligence dashboards."
    },
    objective: {
      pt: "Automatizar a classificação de tickets com alta precisão e integrá-la diretamente ao pipeline de engenharia de dados.",
      en: "Automate ticket classification with high precision and integrate it directly into the data engineering pipeline."
    },
    solution: {
      pt: "Modelo SVM clássico paralelizado sobre Apache Spark e orquestrado com Delta Live Tables para processamento de streaming/batch massivo.",
      en: "Classic SVM model parallelized on Apache Spark and orchestrated with Delta Live Tables for massive streaming/batch processing."
    },
    result: {
      pt: "92% de acurácia em produção, eliminando inteiramente a necessidade de triagem manual para a imensa maioria dos tickets operacionais.",
      en: "92% accuracy in production, entirely eliminating the need for manual triage for the vast majority of operational tickets."
    },
    differentiator: {
      pt: "Capacidade de unir Machine Learning clássico (SVM) com Engenharia de Dados pesada (Spark/Delta).",
      en: "Ability to merge classic Machine Learning (SVM) with heavy Data Engineering (Spark/Delta)."
    },

    // Camada 3
    architecture: {
      pt: "Ingestão via Delta Live Tables -> Processamento Apache Spark -> Classificação SVM -> Data Lake -> Painéis de BI.",
      en: "Ingestion via Delta Live Tables -> Apache Spark Processing -> SVM Classification -> Data Lake -> BI Dashboards."
    },
    dataFlow: {
      pt: "Os tickets fluem pelo ecossistema Databricks para higienização e limpeza inicial, sendo enviados ao cluster Spark para inferência massiva e gravados de volta no Data Lake.",
      en: "Tickets flow through the Databricks ecosystem for initial hygiene and cleaning, being sent to the Spark cluster for massive inference and written back to the Data Lake."
    },
    decisions: {
      pt: [
        "Escolha do algoritmo SVM por estabilidade matemática em dados textuais de alta dimensionalidade em vez de Deep Learning pesado.",
        "Integração nativa no pipeline Spark para evitar tráfego de dados externo."
      ],
      en: [
        "Choice of SVM algorithm for mathematical stability on high-dimensional text data instead of heavy Deep Learning.",
        "Native integration into the Spark pipeline to avoid external data traffic."
      ]
    },
    tradeOffs: {
      pt: [
        "Optamos por orquestrar via Delta Live Tables devido à sinergia nativa com o Databricks — que já era utilizado como fundação para a limpeza dos dados —, evitando o overhead e a latência de cruzar com orquestradores externos clássicos."
      ],
      en: [
        "Opted to orchestrate via Delta Live Tables due to native synergy with Databricks — which was already used as the foundation for data cleaning —, avoiding the overhead and latency of crossing with classic external orchestrators."
      ]
    },
    impact: {
      pt: "Alimentação de dashboards gerenciais de forma quase instantânea, desobstruindo gargalos operacionais.",
      en: "Feeding management dashboards almost instantly, unclogging operational bottlenecks."
    },
    future: {
      pt: "Consolidação de um ecossistema MLOps focado em retreinamento contínuo, reagindo automaticamente a desvios de distribuição (data drift) para manter a acurácia de 92% à prova do tempo.",
      en: "Consolidation of an MLOps ecosystem focused on continuous retraining, reacting automatically to data drift to keep the 92% accuracy future-proof."
    }
  },
  {
    slug: "llms-privados",
    category: {
      pt: "LLMOps & Infraestrutura GenAI",
      en: "LLMOps & GenAI Infrastructure"
    },
    title: {
      pt: "LLMs open-source em ambiente privado",
      en: "Open-source LLMs in private environments"
    },
    summary: {
      pt: "Pipelines de inferência self-hosted de LLMs para reduzir custos corporativos e garantir total segurança de dados sensíveis.",
      en: "Self-hosted LLM inference pipelines to reduce corporate costs and ensure total security of sensitive data."
    },
    metric: "Private",
    metricLabel: { pt: "segurança total dos dados", en: "total data security" },
    role: { pt: "AI Research Scientist", en: "AI Research Scientist" },
    coreTech: ["Llama", "Fine-tuning", "Docker", "Self-hosted LLM"],

    // Camada 2
    context: {
      pt: "Empresas com restrições rígidas de privacidade não podem enviar dados confidenciais para APIs externas (ex: OpenAI, Anthropic).",
      en: "Enterprises with strict privacy constraints cannot send confidential data to external APIs (e.g., OpenAI, Anthropic)."
    },
    problem: {
      pt: "Custo operacional excessivo e risco de vazamento de informações corporativas via provedores de IA em nuvem pública.",
      en: "Excessive operational cost and risk of corporate information leakage via public cloud AI providers."
    },
    objective: {
      pt: "Construir infraestrutura interna para servir Modelos de Linguagem de ponta de forma 100% privada e controlada.",
      en: "Build internal infrastructure to serve state-of-the-art Language Models in a 100% private and controlled manner."
    },
    solution: {
      pt: "Containerização e fine-tuning de modelos da família Llama utilizando Docker em infraestrutura interna (self-hosted).",
      en: "Containerization and fine-tuning of Llama family models using Docker on internal infrastructure (self-hosted)."
    },
    result: {
      pt: "Circunvenção completa de APIs proprietárias, capitalizando sobre o hardware interno de alta performance da empresa para zerar custos marginais de inferência.",
      en: "Complete circumvention of proprietary APIs, capitalizing on the company's high-performance internal hardware to eliminate marginal inference costs."
    },
    differentiator: {
      pt: "Proficiência real em LLMOps: colocar modelos fundacionais para rodar localmente exige profundo conhecimento de hardware e sistemas.",
      en: "Real proficiency in LLMOps: getting foundational models to run locally requires deep knowledge of hardware and systems."
    },

    // Camada 3
    architecture: {
      pt: "Servidor Bare-metal High-end → Docker → Ollama (Motor de Inferência) → API Interna REST.",
      en: "High-end Bare-metal Server → Docker → Ollama (Inference Engine) → Internal REST API."
    },
    dataFlow: {
      pt: "Modelos base da família Llama foram ajustados via PEFT e LoRA, empacotados no Ollama e servidos como microsserviços em contêineres Docker isolados.",
      en: "Base models from the Llama family were fine-tuned via PEFT and LoRA, packaged into Ollama, and served as microservices in isolated Docker containers."
    },
    decisions: {
      pt: [
        "Uso de Docker para isolamento e reprodutibilidade da inferência em qualquer VM corporativa."
      ],
      en: [
        "Use of Docker for isolation and reproducibility of inference on any corporate VM."
      ]
    },
    tradeOffs: {
      pt: [
        "Aproveitamento da alta disponibilidade de VRAM no servidor on-premise, o que nos permitiu rodar os pesos sem a necessidade de estratégias agressivas de quantização que degradariam a precisão."
      ],
      en: [
        "Leveraged high VRAM availability on the on-premise server, allowing us to run weights without the need for aggressive quantization strategies that would degrade accuracy."
      ]
    },
    impact: {
      pt: "Empoderamento da corporação para utilizar inteligência artificial generativa em dados sensíveis sem ferir compliance (LGPD).",
      en: "Empowerment of the corporation to use generative artificial intelligence on sensitive data without breaking compliance (LGPD/GDPR)."
    },
    future: {
      pt: "Pesquisa contínua sobre a evolução da quantização (como GGUF/AWQ avançados) visando escalar para modelos de 70B+ sem precisar ampliar a infraestrutura atual.",
      en: "Continuous research on the evolution of quantization (like advanced GGUF/AWQ) aiming to scale to 70B+ models without needing to expand current infrastructure."
    }
  }
];
