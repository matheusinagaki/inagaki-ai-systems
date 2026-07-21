import { MetadataRoute } from "next";
import { casesData } from "@/data/cases";

export default function sitemap(): MetadataRoute.Sitemap {
  const deploymentHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    "localhost:3000";
    
  const baseUrl = deploymentHost.startsWith("localhost")
    ? `http://${deploymentHost}`
    : `https://${deploymentHost}`;

  const sitemapData: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  casesData.forEach((c) => {
    sitemapData.push({
      url: `${baseUrl}/case/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  });

  return sitemapData;
}
