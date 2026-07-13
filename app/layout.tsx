import type { Metadata } from "next";
import "./globals.css";

const deploymentHost =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  process.env.VERCEL_URL ??
  "localhost:3000";
const metadataBase = new URL(
  deploymentHost.startsWith("localhost")
    ? `http://${deploymentHost}`
    : `https://${deploymentHost}`,
);

export const metadata: Metadata = {
  metadataBase,
  title: "Matheus Inagaki — AI Engineer",
  description: "AI Systems Engineer especializado em transformar GenAI, RAG, agentes e LLMs open-source em sistemas seguros e prontos para produção.",
  keywords: ["AI Engineer", "Generative AI", "RAG", "LLM", "Machine Learning", "Python", "Microsoft Azure"],
  authors: [{ name: "Matheus Inagaki" }],
  creator: "Matheus Inagaki",
  openGraph: {
    title: "Matheus Inagaki — AI Engineer",
    description: "IA que entende contexto. Engenharia que aguenta escala. Produto que move o negócio.",
    type: "website",
    locale: "pt_BR",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Matheus Inagaki — AI Engineer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Matheus Inagaki — AI Engineer",
    description: "AI Systems Engineering · GenAI · RAG · Agents · Production",
    images: ["/og.png"],
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){}})()`;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
