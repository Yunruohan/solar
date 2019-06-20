module.exports = {
  baseUrl: '',
  devServer: {
    proxy: {
      '/api': {
        target: 'http://172.100.108.186:2990',
        changeOrigin: true,
        pathRewrite: {'^/api' : ''}
      },
      '/host': {
        target: 'https://oms.qa.qfpay.net',
        changeOrigin: true,
        pathRewrite: { '^/host': '' }
      },
      '/solar': {
        target: 'http://172.100.108.182:2990',
        changeOrigin: true,
        pathRewrite: { '~/solar': ''}
      }
    }
  },
  lintOnSave: process.env.NODE_ENV === 'development',
  pages: {
    login: {
      entry: 'src/pages/login/main.js',
      title: '登录'
    },
    index: {
      entry: 'src/main.js',
      title: '出行福利管理'
    },
    org: {
      entry: 'src/pages/org/main.js',
      title: '服务商管理'
    },
    welfare: {
      entry: 'src/pages/welfare/main.js',
      title: '出行福利管理'
    },
    trade: {
      entry: 'src/pages/trade/main.js',
      title: '交易管理',
    },
    mchnt: {
      entry: 'src/pages/mchnt/main.js',
      title: '商户管理'
    },
    oper: {
      entry: 'src/pages/oper/main.js',
      title: '运营管理'
    },
    auth: {
      entry: 'src/pages/auth/main.js',
      title: '系统访问控制'
    },
    msg: {
      entry: 'src/pages/msg/main.js',
      title: '消息中心'
    },
    device: {
      entry: 'src/pages/device/main.js',
      title: '设备管理'
    }
  }
}
