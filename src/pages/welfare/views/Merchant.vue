<template>
  <div class="merchant">
    <v-layout align-center justify-end style="height:64px">
      <v-btn @click="addButton()" color="primary" dark>新增商户</v-btn>
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
        <td>{{ props.item.user }}</td>
        <td>{{ props.item.area | formatArea }}</td>
        <td>
          <v-img @click="showImg(props.item.logo)" class="c-p my-1" :src="props.item.logo ? props.item.logo : 'https://near.qfpay.com.cn/40F12F92A55747B8AD759E05968A331D/0/upload/c605e72dd75747d1b583c8946b4eed9d.png'" max-width="50px" aspect-ratio="1"/>
        </td>
        <td>
          <v-btn flat icon color="primary" class="mx-0" @click="goStore(props.item.id, props.item.user)">
            <v-icon small>store</v-icon>
          </v-btn>
        </td>
        <td>
          <v-btn flat icon color="primary" class="mx-0" @click="viewMerchant(props.item)">
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

    <v-dialog v-model="imgShow" max-width="400px">
      <v-img :src='imgSrc' max-width="100%" aspect-ratio="1"/>
    </v-dialog>

    <v-dialog
      v-model="isShowDialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-toolbar card dark color="primary">
        <v-toolbar-title v-if="isReadOnly">商户详情</v-toolbar-title>
        <v-toolbar-title v-else>{{isUpdate ? '修改商户' : '新增商户'}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon dark @click.native="isShowDialog = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-text-field v-if="isReadOnly" label="商户ID" readonly v-model="merchantInfo.id"></v-text-field>
        <v-text-field label="商户名称" counter="40" :readonly="isReadOnly" :rules="formRulse.nameRules" v-model="merchantInfo.name"></v-text-field>
        <v-select
          label="地区"
          :readonly="isReadOnly"
          v-model="merchantInfo.area"
          :rules="formRulse.areaRules"
          :items="selectAreas"
          required
        ></v-select>
        <uploadImage label="logo" :readonly="isReadOnly" ref="uploadimage" :maxNumber="1"/>
        <p class="pt-2" style="color:rgba(0,0,0,.54)">* jpg格式，200k以内，推荐尺寸200*200</p>
        <div v-if="isReadOnly" style="text-align:right;">
          <v-btn @click="update()" color="primary">编辑</v-btn>
        </div>
        <div v-else style="text-align:right;">
          <v-btn :disabled="!valid || isPending" @click="submit()" color="primary">保存</v-btn>
          <v-btn @click="reset()">重置</v-btn>
        </div>
      </v-form>
    </v-dialog>

  </div>
</template>

<script>
// @ is an alias to /src
import UploadImage from '../components/UploadImage'
import qs from 'qs'
export default {
  components: {
    UploadImage
  },
  data () {
    return {
      headers: [
        { text: '商户ID', value: 'id', sortable: false },
        { text: '商户名称', value: 'name', sortable: false },
        { text: '所属地区', value: 'area', sortable: false },
        { text: 'logo', value: 'logo', sortable: false },
        { text: '门店', value: 'id', sortable: false },
        { text: '详情', value: 'id', sortable: false }
      ],
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
      isReadOnly: false,
      isUpdate: false,
      valid: false,
      isPending: false,
      merchantInfo: {
        name: '',
        area: ''
      },
      formRulse: {
        nameRules: [
          v => !!v || '商户名称不能为空',
          v => (v && v.length <= 40) || '40字以内'
        ],
        areaRules: [
          v => !!v || '商户地区不能为空'
        ]
      },
      selectAreas: [{
        value: 'DB',
        text: '迪拜'
      }, {
        value: 'HK',
        text: '香港'
      }, {
        value: 'JP',
        text: '日本'
      }, {
        value: 'TH',
        text: '泰国'
      }],
      imgShow: false, // 点击查看大图
      imgSrc: ''
    }
  },
  created () {
    this.fetchData()
  },
  methods: {
    fetchData () {
      this.isPending = true
      this.$http({
        url: '/travel/merchant/info',
        method: 'GET',
        params: {
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
    showImg (src) {
      this.imgShow = true
      this.imgSrc = src || 'https://near.qfpay.com.cn/40F12F92A55747B8AD759E05968A331D/0/upload/c605e72dd75747d1b583c8946b4eed9d.png'
    },
    goStore (id, name) {
      window.sessionStorage.setItem('merchantName', name)
      this.$router.push({
        name: 'store',
        params: {
          merchantId: id
        }
      })
    },
    addButton () {
      this.isShowDialog = true
      this.isReadOnly = false
      this.isUpdate = false
      this.reset()
    },
    viewMerchant (info) {
      this.isReadOnly = true
      this.merchantInfo.id = info.id
      this.$refs.uploadimage.modifyStatus.splice(0, 1, false)
      this.updateMerchant(info)
    },
    updateMerchant (info) {
      this.isShowDialog = true
      this.isUpdate = true
      this.merchantInfo.name = info.user
      this.merchantInfo.area = info.area
      this.$refs.uploadimage.previewImages.splice(0, 1, info.logo)
      this.$refs.uploadimage.showAddBtn = false
    },
    update () {
      this.isReadOnly = false
    },
    submit () {
      if (!this.$refs.form.validate()) {
        return
      }
      this.isPending = true
      let logoUrl = this.$refs.uploadimage.previewImages[0] || ''
      let params = {
        user: this.merchantInfo.name,
        area: this.merchantInfo.area,
        logo: logoUrl
      }
      if (this.isUpdate) {
        params.mode = 'change_user'
        params.id = this.merchantInfo.id
      } else {
        params.mode = 'add_user'
      }
      this.$http({
        url: '/travel/merchant/options',
        method: 'POST',
        data: qs.stringify(params)
      }).then(response => {
        this.isPending = false
        let res = response.data
        if (res.respcd === '0000') {
          this.isShowDialog = false
          this.reset()
          this.fetchData()
        } else {
          this.$store.dispatch('setAlert', {
            alert: true,
            alertContent: '修改商品成功',
            alertType: 'error'
          })
        }
      })
    },
    reset () {
      this.$refs.form.reset()
      this.isPending = false
      this.$refs.uploadimage.previewImages.splice(0, 1)
      this.$refs.uploadimage.showAddBtn = true
    }
  }
}
</script>
