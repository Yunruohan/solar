import Vue from 'vue'
import Router from 'vue-router'
import { routes as orgRoutes } from './pages/org/router'
Vue.use(Router)

// 原 oms 老页面
const oldRoutes = [
  {
    path: '/merchants',
    name: 'merchants',
    component: () => import('@/components/OldPage.vue')
  },
  {
    path: '/trade',
    name: 'trade',
    component: () => import('@/components/OldPage.vue')
  },
  {
    path: '/chnl/check',
    name: 'chnlcheck',
    component: () => import('@/components/OldPage.vue')
  }
]

export default new Router({
  routes: oldRoutes.concat(orgRoutes)
})
