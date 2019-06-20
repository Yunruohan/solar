import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const routes = [
  {
    path: '/orgManage',
    name: 'orgManage',
    component: () => import('./views/org.vue')
  }
]

const indexRoutes = [
  {
    path: '/',
    name: 'orgIndex',
    redirect: '/orgManage'
  }
]

export {
  routes
}

export default new Router({
  routes: routes.concat(indexRoutes)
})
