import { defineConfig, presetWind } from "unocss";

export default defineConfig({
  presets: [presetWind()],
  rules: [
    [
      "app-region-drag",
      {
        "-webkit-app-region": "drag",
      },
    ],
    [
      "app-region-nodrag",
      {
        "-webkit-app-region": "no-drag",
      },
    ],
  ],
});
