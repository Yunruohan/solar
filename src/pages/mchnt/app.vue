<template>
  <v-app>
    <v-navigation-drawer
      persistent
      :mini-variant="miniVariant"
      :clipped="clipped"
      v-model="drawer"
      width="200"
      enable-resize-watcher
      fixed
      app
    >
      <v-list>
        <template v-for="(nav, i) in navs">
          <v-list-tile v-if="nav.path" :to="nav.path" :key="i">
            <v-icon v-html="nav.icon"></v-icon>
            <v-list-tile-title v-text="nav.title"></v-list-tile-title>
          </v-list-tile>
          <v-list-group
            v-else
            :prepend-icon="nav.icon"
            :value="nav.expend"
            :key="i"
          >
            <v-list-tile slot="activator">
              <v-list-tile-title>{{nav.title}}</v-list-tile-title>
            </v-list-tile>
            <template v-for="(subnav, index) in nav.subnavs">
              <v-list-tile
                ripple
                :key="index"
                :to="subnav.path"
              >
                <v-icon v-html="subnav.icon"></v-icon>
                <v-list-tile-title v-text="subnav.title"></v-list-tile-title>
              </v-list-tile>
            </template>
          </v-list-group>
        </template>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar
      app
      :clipped-left="clipped"
    >
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-btn icon @click.stop="miniVariant = !miniVariant">
        <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"></v-icon>
      </v-btn>
      <v-toolbar-title v-text="title"></v-toolbar-title>
    </v-toolbar>
    <v-content>
      <router-view class="px-3" @toast="toast"/>
      <v-footer class="pl-3">
        <span>&copy; 2018 v0.0.3</span>
      </v-footer>
    </v-content>
    <v-snackbar v-model="$store.state.showSnackbar" :timeout="4000" :color="$store.state.snackbarColor" top>{{$store.state.snackbarText}}</v-snackbar>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      title: '商户管理',
      clipped: false,
      drawer: true,
      fixed: false,
      navs: [{
        title: '商户管理',
        icon: '',
        expend: true,
        subnavs: [{
          icon: 'info',
          path: '/mchntInfo',
          title: '商户信息'
        }, {
          icon: 'account_box',
          path: '/div',
          title: '分账商户'
        }]
      }],
      miniVariant: false,
      snackbarText: '',
      snackbarColor: '',
      showSnackbar: false
    }
  },
  created () {
    this.$http.interceptors.response.use((response) => {
      let res = response.data
      if (res.respcd === '0000') {
        return res
      // } else if (res.respcd === '2002') {
      //   window.location.replace(window.location.origin + '/login.html')
      //   return 'not login'
      // } 
      } else {
        this.$store.dispatch('setSnackbar', {
          showSnackbar: true,
          snackbarText: res.respmsg,
          snackbarColor: 'error'
        })
        return ''
      }
    }, (error) => {
      this.$store.dispatch('setSnackbar', {
        showSnackbar: true,
        snackbarText: '网络错误',
        snackbarColor: 'error'
      })
    })
  },
  methods: {
    toast (msg, color) {
      this.showSnackbar = true
      this.snackbarText = msg
      this.snackbarColor = color
    }
  },
  // 手动设置cookie 正式环境禁用
  mounted() {
    if (location.hostname === 'localhost') {
      document.cookie = 'sessionid=34acdde2-2f90-4ad5-9016-2568946f4a99;'

    }
  }
}
</script>

<style lang="scss">
.pagination-container {
  padding: 20px 0;
  text-align: right;
  .pagination-total, .v-pagination {
    vertical-align: middle;
  }
  .v-text-field.v-text-field--solo .v-input__control {
    min-height: 34px;
  }
  .v-input {
    display: inline-block;
    width: 140px;
    margin: 0 10px 0 20px;
  }
}
.c1 input{
  text-align: center!important;
}
</style>
