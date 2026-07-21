import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const deploymentHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    "localhost:3000";
    
  const baseUrl = deploymentHost.startsWith("localhost")
    ? `http://${deploymentHost}`
    : `https://${deploymentHost}`;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
