import { Metadata } from "next";
import { casesData, CaseStudy } from "@/data/cases";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const caseData: CaseStudy | undefined = casesData.find((c) => c.slug === slug);

  if (!caseData) {
    return {
      title: "Project Not Found | Matheus Inagaki",
    };
  }

  const title = `${caseData.title.en} — AI/ML Case Study | Matheus Inagaki`;
  const description = caseData.summary.en;
  
  const deploymentHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    "localhost:3000";
    
  const baseUrl = deploymentHost.startsWith("localhost")
    ? `http://${deploymentHost}`
    : `https://${deploymentHost}`;
    
  const canonicalUrl = `${baseUrl}/case/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalUrl,
      images: [
        {
          url: `${baseUrl}/linkedin-thumbnail.png`,
          width: 1200,
          height: 627,
          alt: `Case Study: ${caseData.title.en} by Matheus Inagaki`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/linkedin-thumbnail.png`],
    },
  };
}

export default function CaseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
