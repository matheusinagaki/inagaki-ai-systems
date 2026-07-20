import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

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
  title: "Matheus Inagaki — AI Systems Engineer",
  description: "Portfolio featuring Generative AI, RAG, agents and production-ready AI systems.",
  keywords: ["AI Engineer", "Generative AI", "RAG", "LLM", "Machine Learning", "Python", "Microsoft Azure"],
  authors: [{ name: "Matheus Inagaki" }],
  creator: "Matheus Inagaki",
  openGraph: {
    title: "Matheus Inagaki — AI Systems Engineer",
    description: "Portfolio featuring Generative AI, RAG, agents and production-ready AI systems.",
    type: "website",
    url: "https://inagaki-ai-systems.vercel.app/",
    locale: "pt_BR",
    images: [{ url: "https://inagaki-ai-systems.vercel.app/linkedin-thumbnail.png", width: 1200, height: 627, alt: "Matheus Inagaki — AI Systems Engineer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Matheus Inagaki — AI Systems Engineer",
    description: "Portfolio featuring Generative AI, RAG, agents and production-ready AI systems.",
    images: ["https://inagaki-ai-systems.vercel.app/linkedin-thumbnail.png"],
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){}})()`;

  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head><script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
