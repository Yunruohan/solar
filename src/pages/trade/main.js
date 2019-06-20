import '@babel/polyfill'
import Vue from 'vue'
import '@/plugins/vuetify'
import App from './app.vue'
import Axios from 'axios'
import router from './router'
import store from './store'
import '@/assets/stylus/main.styl'
import { DatePicker, Pagination } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.config.productionTip = false

Vue.use(DatePicker)
Vue.use(Pagination)

Vue.prototype.$http = Axios
Axios.defaults.baseURL = process.env.NODE_ENV === 'development' ? 'api/' : ''
Axios.defaults.headers.post['Content-Type'] = 'application/json'

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
