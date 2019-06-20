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
        <span>&copy; 2019 v2.0.2</span>
      </v-footer>
    </v-content>

    <v-snackbar v-model="showSnackbar" :timeout="4000" :color="snackbarColor" top>{{snackbarText}}</v-snackbar>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      title: '公众号配置',
      clipped: false,
      drawer: true,
      fixed: false,
      navs: [{
        title: '运营管理',
        icon: 'account_box',
        expend: true,
        subnavs: [{
          icon: 'assessment',
          path: '/subscription',
          title: '公众号配置'
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
      let resData = response.data
      if (resData.respcd === '0000') {
        return resData.data
      } else if (resData.respcd === '2002') {
        window.location.replace(window.location.origin + '/login.html')
        return 'not login'
      } else {
        this.showSnackbar = true
        this.snackbarText = resData.respmsg
        return 'error'
      }
    }, (error) => {
      console.log(error)
      this.showSnackbar = true
      this.snackbarText = '网络错误'
    })
  },
  methods: {
    toast (msg, color) {
      this.showSnackbar = true
      this.snackbarText = msg
      this.snackbarColor = color
    }
  }
}
</script>

<style lang="scss">
.v-list .v-icon {
  margin-right: 10px;
}
.v-list > div {
  border-top: 1px solid #e0e0e0;
}
.v-list .v-list__tile--active {
  background-color: #f5f5f5;
  .v-icon {
    color: inherit;
  }
}
.v-list__group__header .v-list__group__header__prepend-icon {
  padding-right: 0;
}
.v-list__group__header {
  border-bottom: 1px solid #e0e0e0;
}
.v-list__group__header .v-list__tile {
  padding: 0;
}
.v-list__group__items .v-list__tile {
  padding-left: 30px;
  border-bottom: 1px solid #e0e0e0;
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
  .pagination-total {
    margin-right: 12px;
  }
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
  .v-text-field, .uploadImage {
    width: 380px;
    display: inline-block;
    margin-right: 25px;
  }
  .uploadImage {
    height: 240px;
    margin-bottom: 25px;
  }
  .custom-label {
    font-size: 12px;
    color: rgba(0,0,0,.54);
  }
}
.v-expansion-panel__header {
  background-color: #E9F1FF;
}
.v-expansion-panel__body {
  padding: 0 30px 18px;
}
.v-stepper--vertical .v-stepper__content {
  padding-top: 0;
}
.search-form {
  padding: 20px 0;
  .v-text-field {
    width: 240px;
    margin-right: 30px;
    margin-bottom: 15px;
    display: inline-block;
    vertical-align: middle;
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
.v-footer {
  width: 100%;
  position: absolute;
  bottom: 0;
  right: 0;
}
</style>
