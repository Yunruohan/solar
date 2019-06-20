import '@babel/polyfill'
import Vue from 'vue'
import '@/plugins/vuetify'
import App from './app.vue'
import Axios from 'axios'
import router from './router'
import store from './store'
import filters from './filters'
import '@/assets/stylus/main.styl'

Vue.config.productionTip = false
Vue.prototype.$http = Axios
Axios.defaults.baseURL = process.env.NODE_ENV === 'development' ? 'host/' : ''
Axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
Object.keys(filters).forEach((k) => Vue.filter(k, filters[k]))

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
