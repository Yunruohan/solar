import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const routes = [
  {
    path: '/codes',
    name: 'codes',
    component: () => import('./views/codes.vue')
  },
  {
    path: '/roles',
    name: 'roles',
    component: () => import('./views/roles.vue')
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('./views/users.vue')
  }
]

const indexRoutes = [
  {
    path: '/',
    name: 'authIndex',
    redirect: '/codes'
  }
]

export {
  routes
}

export default new Router({
  routes: routes.concat(indexRoutes)
})
