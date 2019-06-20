<template>
  <div class="store">
    <v-layout align-center justify-space-between style="height:64px">
      <strong class="pl-2">{{merchantName}}</strong>
      <v-btn @click="addStore()" color="primary" dark>新增门店</v-btn>
    </v-layout>
    <v-data-table
      :headers="headers"
      :items="desserts"
      :loading="isPending"
      hide-actions
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.name }}</td>
        <td>{{ props.item.address }}</td>
        <td>{{ props.item.telephone }}</td>
        <td>
          <v-btn flat icon color="primary" class="mx-0" @click="viewStore(props.item)">
            <v-icon small>details</v-icon>
          </v-btn>
        </td>
      </template>
      <template slot="no-data">
        <p style="text-align:center;padding-top:16px;">暂无数据</p>
      </template>
    </v-data-table>
    <div class="pagination-container">
      <span class="pagination-total">共 {{total}} 条</span>
      <v-select
        v-model="pageSize"
        :items="selectItems"
        @change="fetchData()"
        height="20"
        label="10页/条"
        solo
      ></v-select>
      <v-pagination
        v-model="page"
        @input="fetchData()"
        :length="parseInt(total / pageSize) + 1"
        :total-visible="7"
      ></v-pagination>
    </div>

    <v-dialog
      v-model="isShowDialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-toolbar card dark color="primary">
        <v-toolbar-title v-if="isReadOnly">门店详情</v-toolbar-title>
        <v-toolbar-title v-else>{{isUpdate ? '修改门店' : '新增门店'}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon dark @click.native="isShowDialog = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-text-field label="门店名称" :readonly="isReadOnly" counter="40" :rules="formRulse.nameRules" v-model="storeInfo.name"/>
        <v-text-field label="地址" :readonly="isReadOnly" counter="100" :rules="formRulse.addressRules" v-model="storeInfo.address"/>
        <v-text-field label="电话" :readonly="isReadOnly" v-model="storeInfo.telephone"/>
        <div v-if="isReadOnly" style="text-align:right;">
          <v-btn @click="update()" color="primary">编辑</v-btn>
        </div>
        <div v-else style="text-align:right;">
          <v-btn :disabled="!valid" @click="submit()" color="primary">保存</v-btn>
          <v-btn @click="reset()">重置</v-btn>
        </div>
      </v-form>
    </v-dialog>

  </div>
</template>

<script>
import qs from 'qs'
export default {
  data () {
    return {
      merchantId: '',
      merchantName: '',
      headers: [
        { text: '门店名称', value: 'name', sortable: false },
        { text: '地址', value: 'area', sortable: false },
        { text: '电话', value: 'logo', sortable: false },
        { text: '操作', value: 'id', sortable: false }
      ],
      isPending: false,
      desserts: [],
      total: 0,
      page: 1,
      pageSize: 10,
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
      isShowDialog: false, // 新增弹框
      isReadOnly: false, // 详情
      currentStoreId: '',
      isUpdate: false, // 修改
      valid: false,
      storeInfo: {
        name: '',
        address: '',
        telephone: ''
      },
      formRulse: {
        nameRules: [
          v => !!v || '门店名称不能为空'
        ],
        addressRules: [
          v => !!v || '地址不能为空'
        ]
      }
    }
  },
  created () {
    let merchantId = this.$route.params.merchantId
    this.merchantId = merchantId
    this.merchantName = window.sessionStorage.getItem('merchantName')
    this.fetchData(merchantId)
  },
  methods: {
    fetchData (merchantId) {
      this.isPending = true
      this.$http({
        url: '/travel/store/info',
        method: 'GET',
        params: {
          userid: this.merchantId,
          page: this.page - 1,
          pageSize: this.pageSize
        }
      }).then(response => {
        this.isPending = false
        let res = response.data
        if (res.respcd === '0000') {
          this.desserts = res.data.list
          this.total = res.data.total
        }
      })
    },
    addStore () {
      this.isShowDialog = true
      this.isUpdate = false
      this.isReadOnly = false
      this.$refs.form.reset()
    },
    viewStore (info) {
      this.isReadOnly = true
      this.updateStore(info)
    },
    updateStore (info) {
      this.isShowDialog = true
      this.isUpdate = true
      this.currentStoreId = info.id
      this.storeInfo.name = info.name
      this.storeInfo.address = info.address
      this.storeInfo.telephone = info.telephone
    },
    update () {
      this.isReadOnly = false
    },
    submit () {
      let mode = this.isUpdate ? 'change_store' : 'add_store'
      let data = {
        mode
      }
      if (this.isUpdate) {
        data.id = this.currentStoreId
        data.name = this.storeInfo.name
        data.address = this.storeInfo.address
        data.telephone = this.storeInfo.telephone
      } else {
        data.userid = this.merchantId
        data.stores = JSON.stringify(new Array(this.storeInfo))
      }
      this.$http({
        url: '/travel/merchant/options',
        method: 'POST',
        data: qs.stringify(data)
      }).then(response => {
        let res = response.data
        if (res.respcd === '0000') {
          this.isShowDialog = false
          this.fetchData()
        } else {
          this.$store.dispatch('setAlert', {
            alert: true,
            alertContent: res.respmsg,
            alertType: 'error'
          })
        }
      })
    },
    reset () {
      this.$refs.form.reset()
    }
  }
}
</script>
