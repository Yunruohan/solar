<template>
  <v-app>
    <!-- 全局alert -->
    <v-alert
      :value="$store.state.alert"
      :type="$store.state.alertType"
      :color="$store.state.alertColor" class="cus-alert"
    >
      {{$store.state.alertContent}}
    </v-alert>
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
            :prepend-icon="nav.icon ? nav.icon : 'bubble_chart'"
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
    </v-toolbar>

    <v-content>
      <router-view class="px-3"/>
    </v-content>

    <v-footer :fixed="fixed" app>
      <span>&copy; 2018 v1.7.3</span>
    </v-footer>
  </v-app>
</template>

<script>

export default {
  name: 'App',
  data () {
    return {
      clipped: false,
      drawer: true,
      fixed: false,
      navs: [{
        title: '出行福利',
        expend: true,
        icon: 'account_box',
        subnavs: [{
          icon: 'assessment',
          path: '/banner',
          title: 'banner管理'
        }, {
          icon: 'assessment',
          path: '/merchant',
          title: '商户管理'
        }, {
          icon: 'bubble_chart',
          path: '/goods',
          title: '商品管理'
        }, {
          icon: 'bubble_chart',
          path: '/coupon',
          title: '优惠券管理'
        }, {
          path: '/order',
          title: '订单管理'
        }]
      }],
      miniVariant: false,
      title: '出行福利管理'
    }
  },
  created () {
  },
  methods: {

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
