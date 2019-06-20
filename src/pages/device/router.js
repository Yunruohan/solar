import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const routes = [
  {
    path: '/speaker',
    name: 'speaker',
    component: () => import('./views/speaker.vue')
  },
  {
    path: '/upgrade',
    name: 'upgrade',
    component: () => import('./views/upgrade.vue')
  }
]

const indexRoutes = [
  {
    path: '/',
    name: 'deviceIndex',
    redirect: '/speaker'
  }
]

export {
  routes
}

export default new Router({
  routes: routes.concat(indexRoutes)
})
