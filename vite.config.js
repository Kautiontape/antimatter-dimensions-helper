import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/antimatter-dimensions-helper/",
  plugins: [react()],
});
