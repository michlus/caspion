import VueCompositionAPI, { h, ref } from '@vue/composition-api';
import electron from 'electron';
import Vue from 'vue';
import App from './ui/components/App.vue';
import FormField from './ui/components/shared/FormField';
import SplashScreen from './ui/components/SplashScreen.vue';
import { initializeReporter } from './backend/reporting';
import LoggerPlugin from './ui/plugins/logger';
import vuetify from './ui/plugins/vuetify';
import router from './ui/router';
import store from './ui/store';

initializeReporter();

process.on('unhandledRejection', (error) => {
  // eslint-disable-next-line no-console
  console.error(error);
});

const logger = electron.remote.getGlobal('logger');
logger.info('The renderer process got the logger');
Vue.use(LoggerPlugin, { logger });

Vue.use(VueCompositionAPI);

Vue.config.productionTip = process.env.NODE_ENV !== 'production';

Vue.component('form-field', FormField);

new Vue({
  router,
  store: store.original,
  vuetify,

  name: 'IsraeliBankScrapersDesktop',

  setup(_, { root }) {
    const loaded = ref(false);
    root.$store.restored.then(() => {
      loaded.value = true;
    });

    return () => (loaded.value ? h(App) : h(SplashScreen));
  }
}).$mount('#app');
