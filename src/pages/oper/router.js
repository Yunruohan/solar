import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const routes = [
  {
    path: '/subscription',
    name: 'subscription',
    component: () => import('./views/subscription.vue')
  }
]

const indexRoutes = [
  {
    path: '/',
    name: 'operIndex',
    redirect: '/subscription'
  }
]

export {
  routes
}

export default new Router({
  routes: routes.concat(indexRoutes)
})
