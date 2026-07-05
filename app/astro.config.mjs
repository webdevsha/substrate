import { defineConfig } from "astro/config";

// Static output — deploys to Cloudflare Pages with zero adapter.
// When L6 (agents) or server APIs land, switch to @astrojs/cloudflare adapter.
export default defineConfig({
  output: "static",
});
