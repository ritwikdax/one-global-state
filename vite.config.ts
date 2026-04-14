import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  publicDir: false, // don't copy public assets into the library bundle
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ous",
      fileName: (format) => `ous.${format}.js`,
    },
    rollupOptions: {
      // React must not be bundled — consumers provide it
      external: ["react", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react/jsx-runtime": "ReactJsxRuntime",
        },
      },
    },
  },
});
