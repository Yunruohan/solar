import '@babel/polyfill'
import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import Axios from 'axios'
import router from './router'
import './assets/stylus/main.styl'

Vue.config.productionTip = false
Vue.prototype.$http = Axios
Axios.defaults.baseURL = process.env.NODE_ENV === 'development' ? 'host/' : ''

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
