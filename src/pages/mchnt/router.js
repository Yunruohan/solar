import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      redirect: '/mchntInfo'
    },
    {
      path: '/mchntInfo',
      name: 'mchntInfo',
      component: () => import('./views/info.vue')
    },
    {
      path: '/div',
      name: 'div',
      component: () => import('./views/div.vue')
    }
  ]
})
