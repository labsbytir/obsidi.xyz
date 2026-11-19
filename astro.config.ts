import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://obsidi.xyz",
  output: "server",
  adapter: cloudflare({ imageService: "passthrough" }),
  session: false,
});
