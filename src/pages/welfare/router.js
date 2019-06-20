import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      redirect: '/banner'
    }, {
      path: '/banner',
      name: 'banner',
      component: () => import('./views/Banner.vue')
    }, {
      path: '/merchant',
      name: 'merchant',
      component: () => import('./views/Merchant.vue')
    }, {
      path: '/store/:merchantId',
      name: 'store',
      component: () => import('./views/Store.vue')
    }, {
      path: '/goods',
      name: 'goods',
      component: () => import('./views/Goods.vue')
    }, {
      path: '/coupon',
      name: 'coupon',
      component: () => import('./views/Coupon.vue')
    }, {
      path: '/order',
      name: 'order',
      component: () => import('./views/Order.vue')
    }
  ]
})
