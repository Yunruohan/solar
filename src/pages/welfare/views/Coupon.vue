<template>
  <div class="pa-3 coupon">
    <coupon-add @ctrl="getList"/>
    <v-card flat class="mt-2">
    <v-data-table
      :headers="headers"
      :items="list"
      class="elevation-1"
      hide-actions
      :loading="loading"
      :no-data-text="nodatatext"
    >
      <template slot="items" slot-scope="props">
        <td class="text-xs-center">{{ props.item.id }}</td>
        <td class="text-xs-center">{{ props.item.name }}</td>
        <td class="text-xs-center">{{ props.item.bought}}/{{props.item.total }}</td>
        <td class="text-xs-center">{{ props.item.mchnt }}({{props.item.userid}})</td>
        <td class="text-xs-center">{{ props.item.area | formatArea }}</td>
        <td class="px-0 justify-center align-center">
           <v-switch v-model="props.item.status" :messages="props.item.status ? '已上架' : '已下架'" @change="swit(props.item.status, props.item.id)" class="justify-center"></v-switch>
        </td>
        <td class="px-0 justify-center align-center">
          <coupon-detail :item="props.item" @ctrl="getList"/>
        </td>
      </template>
    </v-data-table>
    <div class="pagination-container">
      <span class="pagination-total">共 {{totalItems}} 条</span>
      <v-select
        :items="selectItems"
        height="20"
        label="10页/条"
        solo
        v-model="pageCount"
        @change="pagiChange"
      ></v-select>
      <v-pagination
        v-model="page"
        :length="pageNumber"
        :total-visible="7"
      ></v-pagination>
    </div>
    </v-card>
    <shelf-ctrl type="coupon" @statusCtrl="statusCtrl" @ctrl="ctrl" :visi="visi" :status="stat" :id="id" @close="close"/>
  </div>
</template>
<script>
import { ShelfCtrl, CouponDetail, CouponAdd } from './common/index'
import Http from '@/http'
export default {
  data () {
    return {
      headers: [
        { text: 'ID', align: 'center', sortable: false },
        { text: '优惠券名称', align: 'center', sortable: false },
        { text: '库存', align: 'center', sortable: false },
        { text: '商户', align: 'center', sortable: false },
        { text: '地区', align: 'center', sortable: false },
        { text: '操作', align: 'center', sortable: false },
        { text: '详情', align: 'center', sortable: false }
      ],
      list: [],
      page: 1,
      pageCount: 10,
      selectItems: [{
        value: 10,
        text: '10条/页'
      }, {
        value: 20,
        text: '20条/页'
      }, {
        value: 50,
        text: '50条/页'
      }],
      nodatatext: '正在加载',
      loading: true,
      couponDialog: false,
      totalItems: '',
      visi: false,
      stat: '',
      id: ''
    }
  },
  computed: {
    'pageNumber': function () {
      return Math.ceil(this.totalItems / this.pageCount)
    }
  },
  watch: {
    'page': function (val) {
      this.getList()
    }
  },
  methods: {
    close () {
      this.visi = false
    },
    statusCtrl () {
      this.list.map(item => {
        if (item.id === this.id) {
          item.status = 1 ^ this.stat
        }
      })
    },
    ctrl () {
      this.list.map(item => {
        if (item.id === this.id) {
          item.status = 0 ^ this.stat
        }
      })
    },
    swit (stat, id) {
      this.visi = true
      this.stat = stat
      this.id = id
    },
    pagiChange () {
      this.getList()
    },
    async getList () {
      let res = await Http.get(`/travel/goods/info?type=2&page=${this.page - 1}&pageSize=${this.pageCount}`)
      this.loading = false
      if (res && res.data) {
        if (res.data.respcd === '0000') {
          let list = [...res.data.data.list]
          this.list = [...list]
          if (this.list.length === 0) {
            this.nodatatext = '暂无数据'
          }
          // 设置分页
          this.totalItems = res.data.data.total
        } else {
          // 问题提示
          this.$store.dispatch('setAlert', {
            alert: true,
            alertContent: res.data.respmsg,
            alertType: 'error'
          })
        }
      }
    }
  },
  components: {
    CouponDetail,
    CouponAdd,
    ShelfCtrl
  },
  created () {
    this.getList()
  }
}
</script>
<style scoped>
.flex-grow-4{flex-grow: 4!important;}
td{text-align: center;}
</style>
