import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const routes = [
  {
    path: '/msg',
    name: 'msg',
    component: () => import('./views/msg.vue')
  },
  {
    path: '/msgRecord',
    name: 'msgRecord',
    component: () => import('./views/msgRecord.vue')
  },
  {
    path: '/msgTemplate',
    name: 'msgTemplate',
    component: () => import('./views/msgTemplate.vue')
  }
]

const indexRoutes = [
  {
    path: '/',
    name: 'msgIndex',
    redirect: '/msg'
  }
]

export {
  routes
}

export default new Router({
  routes: routes.concat(indexRoutes)
})
