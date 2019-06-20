const allnavs = [{
  title: '商户管理',
  expend: true,
  subnavs: [{
    code: 'org',
    path: '/org',
    title: '商户信息'
  }, {
    code: 'merchant',
    path: '/merchant',
    title: '商户二维码'
  }, {
    code: 'trade2',
    path: '/trade',
    title: '入网审核'
  }, {
    code: 'org2',
    path: '/tradeb',
    title: '审核黑名单'
  }, {
    code: 'oldpage',
    url: 'https://oms.qa.qfpay.net/merchants',
    title: '老页面'
  }]
}, {
  title: '海外运营',
  subnavs: [{
    code: 'org',
    path: '/orgManage',
    title: '服务商管理'
  }, {
    code: 'oldpage',
    path: '/trade',
    title: '交易明显'
  }, {
    code: 'oldpage',
    path: '/chnl/check',
    title: '通道检查'
  }, {
    code: 'trade2',
    path: '/trade',
    title: '入网审核'
  }, {
    code: 'org2',
    path: '/tradeb',
    title: '审核黑名单'
  }, {
    url: 'https://oms.qa.qfpay.net/merchants',
    title: '老页面'
  }]
}]

export default allnavs
