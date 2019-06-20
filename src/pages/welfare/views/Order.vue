<template>
  <div class="order pa-3">
    <v-card flat>
    <v-data-table
      :headers="headers"
      :items="list"
      class="elevation-1"
      hide-actions
      :loading="loading"
      :no-data-text="nodatatext"
    >
      <template slot="items" slot-scope="props">
        <td class="text-xs-center">{{ props.item.order_id }}</td>
        <td class="text-xs-center">{{ props.item.ctime }}</td>
        <td class="text-xs-center">{{ props.item.name }}</td>
        <td class="text-xs-center">{{ props.item.money }}</td>
        <td class="text-xs-center">{{ props.item.src }}</td>
        <td class="text-xs-center">{{ props.item.customer_id }}</td>
        <td class="text-xs-center">{{ props.item.mchnt }}({{props.item.userid}})</td>
        <td class="text-xs-center">{{ props.item.area | formatArea }}</td>
        <td class="text-xs-center">{{ props.item.status ? '已确认' : '待确认' }}</td>
        <td class="justify-center align-center">
          <v-img :src="props.item.proof" alt="" v-if="props.item.proof" @click="showImg(props.item.proof)" ></v-img>
          <view-proof v-else :item="props.item" @ctrl="getList"/>
        </td>
        <!-- <td class="px-0 justify-center align-center">
          <v-icon color="primary" small>details</v-icon>
        </td> -->
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
    <v-dialog
      v-model="imgShow" attach=".order"
    >
      <v-card class="pa-0" d-flex>
        <img :src="src" alt="" style="max-width: 100%;">
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import { ViewProof } from './common/index'
import Http from '@/http'
export default {
  data () {
    return {
      headers: [
        { text: '订单ID', align: 'center', sortable: false },
        { text: '订单时间', align: 'center', sortable: false },
        { text: '商品名称', align: 'center', sortable: false },
        { text: '支付金额', align: 'center', sortable: false },
        { text: '商品来源', align: 'center', sortable: false },
        { text: '消费者', align: 'center', sortable: false },
        { text: '店铺', align: 'center', sortable: false },
        { text: '地区', align: 'center', sortable: false },
        { text: '订单状态', align: 'center', sortable: false },
        { text: '核销凭证', align: 'center', sortable: false }
      ],
      page: 1,
      pageCount: 10,
      totalItems: '',
      src: '',
      imgShow: false,
      nodatatext: '正在加载',
      loading: true,
      list: [],
      selectItems: [{
        value: 10,
        text: '10条/页'
      }, {
        value: 20,
        text: '20条/页'
      }, {
        value: 50,
        text: '50条/页'
      }]
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
    pagiChange () {
      this.getList()
    },
    showImg (src) {
      this.src = src
      this.imgShow = true
    },
    async getList () {
      let res = await Http.get(`/travel/order/info?page=${this.page - 1}&pageSize=${this.pageCount}`)
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
    ViewProof
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
