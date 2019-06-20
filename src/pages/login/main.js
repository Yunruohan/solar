import '@babel/polyfill'
import Vue from 'vue'
import '@/plugins/vuetify'
import App from './login.vue'
import Axios from 'axios'
import 'vuetify/dist/vuetify.min.css'

Vue.config.productionTip = false
Vue.prototype.$http = Axios
Axios.defaults.baseURL = process.env.NODE_ENV === 'development' ? 'host/' : ''
Axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

new Vue({
  render: h => h(App)
}).$mount('#app')
