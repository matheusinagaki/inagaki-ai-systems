import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title: "Matheus Inagaki — AI Engineer",
    description: "AI Engineer especializado em GenAI, RAG, agentes autônomos, LLMs open-source e sistemas de Machine Learning em produção.",
    keywords: ["AI Engineer", "Generative AI", "RAG", "LLM", "Machine Learning", "Python", "Microsoft Azure"],
    authors: [{ name: "Matheus Inagaki" }],
    creator: "Matheus Inagaki",
    openGraph: {
      title: "Matheus Inagaki — AI Engineer",
      description: "Arquitetando sistemas de IA que saem do experimento e geram impacto real.",
      type: "website",
      locale: "pt_BR",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "Matheus Inagaki — AI Engineer" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Matheus Inagaki — AI Engineer",
      description: "GenAI · RAG · AI Agents · Open-source LLMs",
      images: ["/og.png"],
    },
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){}})()`;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
