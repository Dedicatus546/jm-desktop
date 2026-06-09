import { createVuetify as cv } from 'vuetify'
import { Intersect } from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

export const createVuetify = () => {
  const isAuto = APP_STATE.config.theme === 'auto'
  return cv({
    theme: {
      defaultTheme: isAuto ? 'system' : APP_STATE.config.theme,
      themes: {
        light: {
          dark: false,
          colors: {
            primary: '#ff9800',
            'on-primary': '#ffffff',
          },
        },
        dark: {
          dark: true,
          colors: {
            primary: '#633b00',
            'on-primary': '#ffffff',
          },
        },
      },
    },
    directives: {
      Intersect,
    },
    icons: {
      defaultSet: 'mdi',
      aliases: {
        ...aliases,
      },
      sets: {
        mdi,
      },
    },
  })
}
