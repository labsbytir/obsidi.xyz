import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://obsidi.xyz",
  output: "server",
  adapter: cloudflare({ imageService: "passthrough" }),
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
  session: false,
  devToolbar: { enabled: false },
});
