import Vue from 'vue'
import Vuetify from 'vuetify'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
// import 'vuetify/dist/vuetify.min.css'
import zhHans from 'vuetify/es5/locale/zh-Hans'

Vue.use(Vuetify, {
  iconfont: 'md',
  theme: {
    primary: '#00B3E3',
    secondary: '#febf32',
    accent: '#f17a25'
  },
  lang: {
    locales: { zhHans },
    current: 'zh-Hans'
  }
})
