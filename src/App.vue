<template>
  <v-app :dark="isDark">
    <!-- 全局alert -->
    <!-- <v-alert
      :value="$store.state.alert"
      :type="$store.state.alertType"
      :color="$store.state.alertColor" class="cus-alert"
    >
      {{$store.state.alertContent}}
    </v-alert> -->
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
          <v-list-group
            :prepend-icon="nav.icon ? nav.icon : 'bubble_chart'"
            :value="nav.expend"
            :key="i"
          >
            <v-list-tile slot="activator">
              <v-list-tile-title>{{nav.title}}</v-list-tile-title>
            </v-list-tile>
            <template v-for="(subnav, index) in nav.subnavs">
              <v-list-tile
                v-if="subnav.code"
                ripple
                :key="index"
                :to="subnav.path"
              >
                <v-icon v-html="subnav.icon ? subnav.icon : 'bubble_chart'"></v-icon>
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
      <v-spacer></v-spacer>
      <span>昵称</span>
      <v-btn class="invert_colors_button" flat icon :color="isDark ? 'white' : 'grey'" @click="invertColors()">
        <v-icon>invert_colors</v-icon>
      </v-btn>
      <v-btn flat icon :color="isDark ? 'white' : 'grey'" @click="logout()">
        <v-icon>exit_to_app</v-icon>
      </v-btn>
    </v-toolbar>

    <v-content>
      <router-view class="px-3"/>
    </v-content>

    <v-footer :fixed="fixed" app>
      <span>&copy; 2019 v2.0.0</span>
    </v-footer>

    <v-snackbar v-model="showSnackbar" :timeout="4000" :color="snackbarColor" top>{{snackbarText}}</v-snackbar>
  </v-app>
</template>

<script>
import AllNavs from './allnavs'
export default {
  name: 'App',
  data () {
    return {
      clipped: false,
      drawer: true,
      fixed: false,
      navs: [],
      miniVariant: false,
      title: '出行福利管理',
      isDark: false,
      snackbarText: '',
      snackbarColor: '',
      showSnackbar: false
    }
  },
  beforeCreate () {
    this.$http.interceptors.response.use((response) => {
      let resData = response.data
      if (resData.respcd === '0000') {
        return resData.data
      } else if (resData.respcd === '2002') {
        window.location.replace(window.location.origin + '/login.html')
        return 'error'
      } else {
        this.showSnackbar = true
        this.snackbarText = resData.respmsg
        return 'error'
      }
    }, (error) => {
      console.log(error)
      this.toast('网络错误', 'error')
    })
  },
  created () {
    let codes = ['org', 'merchant', 'trade', 'oldpage', 'oper']
    AllNavs.map((nav) => {
      let tmpsubnavs = []
      nav.subnavs.map((subnav) => {
        if (codes.includes(subnav.code)) {
          tmpsubnavs.push(subnav)
        }
      })
      nav.subnavs = [...tmpsubnavs]
    })
    // 没有子导航，则删除整个父级导航
    AllNavs.map((nav, index) => {
      if (nav.subnavs.length === 0) {
        AllNavs.splice(index, 1)
      }
    })
    this.navs = [...AllNavs]
  },
  methods: {
    toast (msg, color) {
      this.showSnackbar = true
      this.snackbarText = msg
      this.snackbarColor = color
    },
    invertColors () {
      this.isDark = !this.isDark
      if (this.isDark) {
        this.$vuetify.theme.primary = '#008875'
      } else {
        this.$vuetify.theme.primary = '#00B3E3'
      }
    }
  }
}
</script>

<style lang="scss">
.v-list .v-icon {
  margin-right: 10px;
}
.v-list .v-list__group__header--active {
  color: #00B3E3;
}
.v-list.theme--dark .v-list__group__header--active {
  color: #6af7e3;
  .v-list__group__header__prepend-icon {
    color: inherit !important;
  }
}
.v-list .v-list__group__header .v-list__group__header__prepend-icon {
  min-width: auto;
  padding-right: 0;
}
.v-list__group__header .v-list__tile {
  padding: 0;
}
.theme--light.v-list .v-list__tile--link:hover,
.theme--light.v-list .v-list__tile--highlighted,
.theme--light.v-list .v-list__group__header:hover {
  color: #000 !important;
  .v-icon {
    color: inherit;
  }
}
.v-list .v-list__tile--active {
  background-color: #00B3E3;
  color: #fff !important;
  .v-icon {
    color: inherit;
  }
}
.v-list.theme--dark .v-list__tile--active {
  background-color: #008875;
}
.v-list__group__items .v-list__tile {
  padding-left: 30px;
  border-top: 1px solid #e0e0e0;
}
.theme--dark .v-list__group__items .v-list__tile {
  border-color: #848484;
}
.v-icon {
  user-select: none;
}
:focus {
  outline: none;
}
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
.v-dialog--fullscreen {
  background-color: #fff;
  .v-form {
    padding: 30px;
    max-width: 600px;
  }
  .custom-label {
    font-size: 12px;
    color: rgba(0,0,0,.54);
  }
}
.v-table {
  .v-input--switch {
    padding: 10px 0;
    .v-input__slot {
      margin-bottom: 6px;
    }
    &.v-input--is-label-active .v-messages__message {
      color: #1976d2;
    }
  }
}
.show {
  display: block !important;
}
.hide {
  display: none !important;
}
.c-p {
  cursor: pointer;
}
.close-imgshow-dialog {
  z-index: 1000;
  position: absolute;
  right: 0;
  top: 0;
}
.banner .v-dialog, .order .v-dialog, .coupon .v-dialog{width: auto;display: flex;}
// .v-form{max-width: 100%!important;padding: 0!important;}
.cus-alert{z-index: 999;width: 500px;border-radius: 5px;position: fixed;left: 0;top: 0;right: 0;}
.cus-toolbar .v-toolbar__content{justify-content: space-between!important;}
</style>
