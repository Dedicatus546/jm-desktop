import { defineConfig, presetWind4, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4({
      prefix: 'wind-',
      preflights: {
        reset: false,
      },
    }),
    presetIcons({
      processor(props) {
        delete props.color
      },
    }),
  ],
  outputToCssLayers: {
    cssLayerName: (layer) => `unocss-${layer}`,
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
