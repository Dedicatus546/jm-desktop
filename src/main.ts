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
import { normalizeError } from "./utils";

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

app.config.errorHandler = (err) => {
  logger.error(`[vue] ${normalizeError(err)}`);
};

app.config.performance = true;

app.use(vuetify).use(pinia).use(router);

app.mount("#root");
