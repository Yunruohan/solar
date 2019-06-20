<template>
  <div class="goods">
    <v-layout align-center justify-end style="height:64px">
      <v-btn @click="addButton()" color="primary" dark>新增商品</v-btn>
    </v-layout>
    <v-data-table
      :headers="headers"
      :items="desserts"
      :loading="isPending"
      hide-actions
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.id }}</td>
        <td>{{ props.item.name }}</td>
        <td>￥{{ props.item.original | formatCurrency }}</td>
        <td>￥{{ props.item.current | formatCurrency }}</td>
        <td>{{ props.item.bought }}/{{ props.item.total }}</td>
        <td>{{ props.item.mchnt }} ({{ props.item.userid }})</td>
        <td>{{ props.item.area | formatArea }}</td>
        <td>
          <v-switch @change="beforeUpdateStatus($event, props.item.id)" v-model="props.item.status" color="primary" :messages="props.item.status === 1 ? '已上架' : '已下架'"  :true-value="1" :false-value="0"></v-switch>
        </td>
        <td>
          <v-btn flat icon color="primary" class="mx-0" @click="viewGoods(props.item)">
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
        <v-toolbar-title v-if="isReadOnly">商品详情</v-toolbar-title>
        <v-toolbar-title v-else>{{isUpdate ? '修改商品' : '新增商品'}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon dark @click.native="isShowDialog = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-text-field label="名称" :readonly="isReadOnly" :rules="formRulse.nameRules" counter="100" v-model="goodsInfo.name"/>
        <uploadImage label="图片" :readonly="isReadOnly" ref="uploadimage" :maxNumber="9"/>
        <p class="pt-2" style="color:rgba(0,0,0,.54)">* jpg格式，最多9张，不超过200k, 推荐尺寸254*192</p>
        <v-textarea label="描述" counter="1000" :readonly="isReadOnly" :rules="formRulse.introRules" auto-grow v-model="goodsInfo.intro"/>
        <uploadImage label="详细图" :readonly="isReadOnly" ref="uploadetail" :maxNumber="9"/>
        <p class="pt-2" style="color:rgba(0,0,0,.54)">* jpg格式，最多9张，不超过300k, 推荐尺寸宽400~600，高不限</p>
        <v-text-field label="原价" ref="original" :readonly="isReadOnly" :rules="formRulse.originalRules" v-model="original_format" @input="verifyCurrency()" :error-messages="currencyErrorMessages"/>
        <v-text-field label="现价" ref="current" :readonly="isReadOnly" :rules="formRulse.currentRules" v-model="current_format" @input="verifyCurrency()" :error-messages="currencyErrorMessages"/>
        <v-text-field label="库存" :readonly="isReadOnly" :rules="formRulse.totalRules" v-model="goodsInfo.total"/>
        <label class="custom-label">有效期</label>
        <v-layout align-center justify-space-between>
          <v-menu v-model="startDatemenu" :disabled="isReadOnly" transition="scale-transition" :close-on-content-click="false" style="width:260px">
            <v-text-field append-icon="event" :rules="formRulse.dateRules" slot="activator" readonly label="开始日期" v-model="goodsInfo.start_date"></v-text-field>
            <v-date-picker color="primary" v-model="goodsInfo.start_date" :max="goodsInfo.end_date" locale="zh-Hans" no-title @input="startDatemenu = false"></v-date-picker>
          </v-menu>
          <v-menu v-model="endDatemenu" :disabled="isReadOnly" transition="scale-transition" :close-on-content-click="false" style="width:260px">
            <v-text-field append-icon="event" :rules="formRulse.dateRules" slot="activator" readonly label="结束日期" v-model="goodsInfo.end_date"></v-text-field>
            <v-date-picker color="primary" v-model="goodsInfo.end_date" :min="goodsInfo.start_date" locale="zh-Hans" no-title @input="endDatemenu = false"></v-date-picker>
          </v-menu>
        </v-layout>
        <label class="custom-label">使用时间段</label>
        <v-layout align-center justify-space-between>
          <v-menu ref="startmenu" v-model="startTimeMenu" :disabled="isReadOnly" :close-on-content-click="false" transition="scale-transition" style="width:260px">
            <v-text-field label="开始时间" ref="startime" append-icon="event" slot="activator" readonly v-model="goodsInfo.startTime"></v-text-field>
            <v-time-picker v-if="startTimeMenu" v-model="goodsInfo.startTime" :max="goodsInfo.endTime" format="24hr" no-title @change="$refs.startmenu.save(goodsInfo.startTime)"></v-time-picker>
          </v-menu>
          <v-menu ref="endmenu" v-model="endTimeMenu" :disabled="isReadOnly" :close-on-content-click="false" transition="scale-transition" style="width:260px">
            <v-text-field label="结束时间" ref="endtime" append-icon="event" slot="activator" readonly v-model="goodsInfo.endTime"></v-text-field>
            <v-time-picker v-if="endTimeMenu" v-model="goodsInfo.endTime" :min="goodsInfo.startTime" format="24hr" no-title @change="$refs.endmenu.save(goodsInfo.endTime)"></v-time-picker>
          </v-menu>
        </v-layout>
        <v-textarea label="注意事项" :readonly="isReadOnly" counter="400" :rules="formRulse.noticeRules" auto-grow v-model="goodsInfo.notice"></v-textarea>
        <v-text-field label="商品来源" :readonly="isReadOnly" :counter="goodsInfo.src ? 10 : undefined" :rules="formRulse.srcRules" v-model="goodsInfo.src"/>
        <v-text-field label="关联商户id" :readonly="isReadOnly" :rules="formRulse.useridRules" v-model="goodsInfo.userid" :error-messages="useridErrorMessages" @blur="fetchStores($event.target.value, true)"/>
        <v-select
          label="兑换门店"
          :items="stores"
          item-text="name"
          item-value="id"
          :rules="formRulse.storesRules"
          v-model="goodsInfo.exchange"
          multiple
          return-object
          chips
        ></v-select>
        <div v-if="isReadOnly" style="text-align:right;">
          <v-btn @click="isReadOnly = false" color="primary">编辑</v-btn>
        </div>
        <div v-else style="text-align:right;">
          <v-btn :disabled="!valid" @click="submit()" color="primary">保存</v-btn>
          <v-btn @click="reset()">重置</v-btn>
        </div>
      </v-form>
    </v-dialog>
    <comfirm @okHandler="updateStatus()" @cancelHandler="cancelUpdateStatus()" :isVisiable="showComfirm" :msg="currentItem.status === 1 ? '确定下架该商品吗？' : '确定上架该商品吗？'" />
  </div>
</template>

<script>
// @ is an alias to /src
import UploadImage from '../components/UploadImage'
import Comfirm from '@/components/Comfirm'
import qs from 'qs'
export default {
  components: {
    UploadImage,
    Comfirm
  },
  data () {
    return {
      headers: [
        { text: '商品ID', value: 'id', sortable: false },
        { text: '商品名称', value: 'name', sortable: false },
        { text: '原价', value: 'original', sortable: false },
        { text: '现价', value: 'current', sortable: false },
        { text: '库存', value: 'total', sortable: false },
        { text: '商户', value: 'id', sortable: false },
        { text: '地区', value: 'address', sortable: false },
        { text: '状态', value: 'status', sortable: false },
        { text: '详情', value: 'id', sortable: false }
      ],
      isPending: false,
      desserts: [],
      total: 0,
      page: 1,
      pageSize: 10,
      currentItem: {}, // 当前操作 table item
      showComfirm: false,
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
      isReadOnly: false,
      isUpdate: false,
      valid: false,
      startDatemenu: false,
      endDatemenu: false,
      startTimeMenu: false,
      endTimeMenu: false,
      goodsInfo: {
        name: '',
        images: [],
        intro: '',
        details: [],
        notice: '',
        start_date: '',
        end_date: '',
        startTime: null,
        endTime: null,
        exchange: [],
        userid: ''
      },
      stores: [], // 适用门店
      formRulse: {
        nameRules: [
          v => !!v || '商品名称不能为空',
          v => (v && v.length <= 100) || '100字以内'
        ],
        introRules: [
          v => (v && v.length <= 1000) || '1000字以内'
        ],
        originalRules: [
          v => !!v || '原价不能为空',
          v => /^\d+(\.\d{1,2})?$/.test(v) || '原价格式不正确'
        ],
        currentRules: [
          v => !!v || '现价不能为空',
          v => /^\d+(\.\d{1,2})?$/.test(v) || '现价格式不正确'
        ],
        totalRules: [
          v => !!v || '库存不能为空',
          v => /^[1-9]\d*$/.test(v) || '库存必须为数值'
        ],
        dateRules: [
          v => !!v || '有效期不能为空'
        ],
        useridRules: [
          v => !!v || '关联商户id不能为空'
        ],
        srcRules: [
          v => (!v || v.length <= 10) || '10字以内'
        ],
        storesRules: [
          v => (Array.isArray(v) && v.length > 0) || '兑换门店不能为空'
        ],
        noticeRules: [
          v => (v && v.length <= 400) || '400字以内'
        ]
      },
      currencyErrorMessages: '',
      useridErrorMessages: ''
    }
  },
  computed: {
    current_format: {
      get: function () {
        return this.goodsInfo.current / 100 || ''
      },
      set: function (value) {
        this.goodsInfo.current = value * 100 || ''
      }
    },
    original_format: {
      get: function () {
        return this.goodsInfo.original / 100 || ''
      },
      set: function (value) {
        this.goodsInfo.original = value * 100 || ''
      }
    }
  },
  created () {
    this.fetchData()
  },
  methods: {
    verifyCurrency() {
      if (!this.goodsInfo.current || !this.goodsInfo.original) {
        return
      }
      if (this.goodsInfo.original < this.goodsInfo.current) {
        this.currencyErrorMessages = '原价不能小于现价'
      } else {
        this.currencyErrorMessages = ''
      }
    },
    fetchData () {
      this.isPending = true
      this.$http({
        url: '/travel/goods/info',
        method: 'GET',
        params: {
          type: 1,
          pageSize: this.pageSize,
          page: this.page - 1 // 接口 第一页 page = 0
        }
      }).then(response => {
        this.isPending = false
        let res = response.data
        if (res.respcd === '0000') {
          this.desserts = res.data.list
          this.total = res.data.total
        } else {
          this.$store.dispatch('setAlert', {
            alert: true,
            alertContent: res.respmsg,
            alertType: 'error'
          })
        }
      })
    },
    fetchStores (id, resetSelected) {
      if (resetSelected && Number(id) === this.goodsInfo.userid) {
        return
      }
      this.$http({
        url: '/travel/goods/options',
        method: 'POST',
        data: qs.stringify({
          id,
          mode: 'shop_info'
        })
      }).then(response => {
        let res = response.data
        if (res.respcd === '0000') {
          this.useridErrorMessages = ''
          if (resetSelected) {
            this.stores = []
            this.goodsInfo.exchange = []
          }
          res.data.map((item) => {
            this.stores.push({
              id: item.id,
              name: item.name
            })
          })
        } else if (res.respcd === '2102') {
          this.useridErrorMessages = '该商户不存在，请检查商户id是否正确'
        } else if (res.respcd === '2101') {
          this.useridErrorMessages = '该商户下没有门店，请先添加门店'
        }
      })
    },
    addButton () {
      this.reset()
      this.isReadOnly = false
      this.isShowDialog = true
      this.isUpdate = false
    },
    goGoodsDetail (id, name) {
      window.sessionStorage.setItem('goodsName', name)
      this.$router.push({
        name: 'store',
        params: {
          goodsId: id
        }
      })
    },
    viewGoods (info) {
      this.isReadOnly = true
      this.isShowDialog = true
      this.isUpdate = true
      this.goodsInfo = { ...info }
      this.goodsInfo.start_date = info.start_date.substr(0, 10)
      this.goodsInfo.end_date = info.end_date.substr(0, 10)
      if (info.cut_expire) {
        this.goodsInfo.startTime = info.cut_expire[0].start_time
        this.goodsInfo.endTime = info.cut_expire[0].end_time
      }
      delete this.goodsInfo['cut_expire']
      this.$refs.uploadimage.previewImages = [...info.images]
      this.$refs.uploadetail.previewImages = [...info.details]
      this.fetchStores(info.userid, false)
    },
    submit () {
      if (!this.$refs.form.validate()) {
        return
      }
      let images = this.$refs.uploadimage.previewImages
      let details = this.$refs.uploadetail.previewImages
      if (images.length === 0) {
        this.$store.dispatch('setAlert', {
          alert: true,
          alertContent: '请上传商品图片',
          alertType: 'warning'
        })
        return false
      }
      if (details.length === 0) {
        this.$store.dispatch('setAlert', {
          alert: true,
          alertContent: '请上传商品详情图',
          alertType: 'warning'
        })
        return false
      }
      let startTime = this.goodsInfo.startTime
      let endTime = this.goodsInfo.endTime
      if ((!!startTime && !endTime) || (!startTime && !!endTime)) {
        this.$store.dispatch('setAlert', {
          alert: true,
          alertContent: '请填写完整使用时间段',
          alertType: 'warning'
        })
        return false
      }
      let params = { ...this.goodsInfo }
      params.images = JSON.stringify(images)
      params.details = JSON.stringify(details)
      params.exchange = JSON.stringify(params.exchange)
      if (params.start_date.length === 10) {
        params.start_date += ' 00:00:00'
      }
      if (params.end_date.length === 10) {
        params.end_date += ' 23:59:59'
      }
      params.cut_expire = JSON.stringify(new Array({
        start_time: params.startTime,
        end_time: params.endTime
      }))
      delete params['startTime']
      delete params['endTime']
      let mode = this.isUpdate ? 'change_info' : 'add_info'
      params.mode = mode
      params.type = 1
      this.$http({
        url: '/travel/goods/options',
        method: 'POST',
        data: qs.stringify(params)
      }).then(response => {
        let res = response.data
        if (res.respcd === '0000') {
          this.$store.dispatch('setAlert', {
            alert: true,
            alertContent: this.isUpdate ? '修改商品成功' : '新增商品成功',
            alertType: 'success'
          })
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
    beforeUpdateStatus (value, id) {
      let status = value === 1 ? 0 : 1
      this.showComfirm = true
      this.currentItem = {
        status,
        id
      }
    },
    cancelUpdateStatus () {
      this.showComfirm = false
      this.desserts.map((item) => {
        if (item.id === this.currentItem.id) {
          item.status = this.currentItem.status
        }
      })
    },
    updateStatus () {
      let status = this.currentItem.status === 1 ? 0 : 1
      this.$http({
        url: '/travel/goods/options',
        method: 'POST',
        data: qs.stringify({
          id: this.currentItem.id,
          mode: 'change_info',
          status
        })
      }).then(response => {
        let res = response.data
        if (res.respcd === '0000') {
          this.showComfirm = false
          this.$store.dispatch('setAlert', {
            alert: true,
            alertContent: status === 1 ? '上架商品成功' : '下架商品成功',
            alertType: 'success',
            alertColor: status === 1 ? 'primary' : 'rgba(0,0,0,.38)'
          })
        }
      })
    },
    reset () {
      this.$refs.form.reset()
      this.useridErrorMessages = ''
      this.currencyErrorMessages = ''
      this.$refs.uploadimage.previewImages = []
      this.$refs.uploadetail.previewImages = []
    }
  }
}
</script>
