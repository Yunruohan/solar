import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      redirect: '/channel'
    },
    {
      path: '/channel',
      name: 'channel',
      component: () => import('./views/channel.vue')
    },
    {
      path: '/regi',
      name: 'regi',
      component: () => import('./views/regi.vue')
    },
    {
      path: '/refundchnl',
      name: 'refundchnl',
      component: () => import('./views/refundChnl.vue')
    },
    {
      path: '/refundmchnt',
      name: 'refundmchnt',
      component: () => import('./views/refundMchnt.vue')
    },
    {
      path: '/refundbill',
      name: 'refundbill',
      component: () => import('./views/refundBill.vue')
    },
    {
      path: '/refundrecord',
      name: 'refundrecord',
      component: () => import('./views/refundRecord.vue')
    }
  ]
})
