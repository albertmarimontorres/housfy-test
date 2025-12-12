import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from '@/router';

import App from './App.vue';

// Vuetify imports
import 'vuetify/styles/main.css';
import '@mdi/font/css/materialdesignicons.min.css';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#11AEFA',
          'primary-darken-1': '#0E8BC7', // Variante más oscura del primary
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
        },
      },
      dark: {
        colors: {
          primary: '#11AEFA',
          'primary-darken-1': '#0E8BC7',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
        },
      },
    },
  },
});

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vuetify);

app.mount('#app');
