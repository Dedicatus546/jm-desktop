import "@mdi/font/css/materialdesignicons.css";
import "swiper/swiper-bundle.css";
import "typeface-roboto";
import "vuetify/styles";
import "virtual:uno.css";
import "./style.css";

import { createApp } from "vue";
import { createVuetify } from "vuetify";
import { Intersect } from "vuetify/directives";

import App from "./App.vue";
import logger from "./logger";
import router from "./router";
import pinia from "./store";

const vuetify = createVuetify({
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        dark: false,
        colors: {
          primary: "#ff9800",
          "on-primary": "#ffffff",
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: "#633b00",
          "on-primary": "#ffffff",
        },
      },
    },
  },
  directives: {
    Intersect,
  },
});

const app = createApp(App);

app.config.errorHandler = (err, _instance, info) => {
  logger.error(`[vue] 全局捕获错误，错误码 ${info} 错误信息 ${String(err)}`);
  if (err instanceof Error) {
    logger.error(`${err.stack}`);
  }
};

app.config.performance = true;

app.use(vuetify).use(pinia).use(router);

app.mount("#root");
