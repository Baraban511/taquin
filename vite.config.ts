import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import Icons from "unplugin-icons/vite";
import { version } from "./package.json";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [
    sveltekit(),
    Icons({
      compiler: "svelte",
      autoInstall: true,
    }),
    tailwindcss(),
  ],
  define: {
    "process.env.VERSION": JSON.stringify(version),
  },
});
