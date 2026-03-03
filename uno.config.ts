import { defineConfig, presetWind4 } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4({
      prefix: 'wind-',
    }),
  ],
  outputToCssLayers: {
    cssLayerName: () => "unocss"
  },
  rules: [
    [
      'app-region-drag',
      {
        '-webkit-app-region': 'drag',
      },
    ],
    [
      'app-region-nodrag',
      {
        '-webkit-app-region': 'no-drag',
      },
    ],
  ],
})
