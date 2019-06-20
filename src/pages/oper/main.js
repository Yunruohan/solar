import '@babel/polyfill'
import Vue from 'vue'
import '@/plugins/vuetify'
import App from './app.vue'
import Axios from 'axios'
import router from './router'
import '@/assets/stylus/main.styl'
// import filters from './filters'

Vue.config.productionTip = false
Vue.prototype.$http = Axios
Axios.defaults.baseURL = process.env.NODE_ENV === 'development' ? 'host/' : ''
// Object.keys(filters).forEach((k) => Vue.filter(k, filters[k]))

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
