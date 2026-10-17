import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Alderwood Vantage - Raising Leaders, Not Just Employees",
    short_name: "Alderwood Vantage",
    description:
      "Validated cognitive assessments, expert counselling, mentorship and 5-year developmental roadmaps for students.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBFBF9",
    theme_color: "#FBFBF9",
    icons: [
      {
        src: "/icon.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
