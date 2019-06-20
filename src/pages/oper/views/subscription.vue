<template>
  <div class="oper">
    <v-form ref="searchForm" class="search-form elevation-1">
      <!-- <v-select
        label="公众号" hide-details
        :items="Object.keys(apps)"
        clearable
        v-model="searchParams.appname"
      >
      </v-select> -->
      <v-autocomplete
        v-model="searchParams.appname"
        :items="Object.keys(apps)"
        clearable
        label="公众号"
      >
      </v-autocomplete>
      <v-text-field label="主体名称" hide-details v-model="searchParams.main"/>
      <v-text-field label="渠道号" hide-details v-model="searchParams.cid"/>
      <v-text-field label="APPID" hide-details v-model="searchParams.appid"/>
      <v-text-field label="商户ID" hide-details v-model="searchParams.uid"/>
      <v-autocomplete
        label="通道" hide-details
        v-model="select.name"
        clearable
        :hint="`${select.value}, ${select.name}`"
        :items="chnlcode"
        item-text="value"
        item-value="name"
      >
      </v-autocomplete>
      <div style="text-align:right">
        <v-btn @click="search()" color="primary">查找</v-btn>
        <v-btn @click="reSearch()">重置</v-btn>
      </div>
    </v-form>
    <div style="text-align:left;padding:20px 0 6px;">
      <v-btn @click="addPublic()" color="primary">新增</v-btn>
      <v-btn @click="downExcel()" color="accent">导出</v-btn>
    </div>
    <v-data-table
      :headers="headers"
      :items="desserts"
      :loading="isPending"
      hide-actions
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.main }}</td>
        <td>{{ props.item.cid }}</td>
        <td>{{ props.item.pay_appid }}</td>
        <td><p style="word-break: break-all;margin-top:15px;">{{ props.item.menu }}</p></td>
        <td>{{ props.item.appname }}</td>
        <td>{{ props.item.appid }}</td>
        <td><p style="word-break: break-all;margin-top:15px;">{{ props.item.uid }}</p></td>
        <td>{{ chnlcodeObject[props.item.chnlcode] }}</td>
        <td>{{ belong[props.item.belong] }}</td>
        <td>{{ confmodel[props.item.confmodel] }}</td>
        <td>
          <v-btn flat icon color="primary" class="mx-0" @click="changeDetails(props.item)">
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
      width="50%"
      transition="dialog-bottom-transition"
    >
    <v-card>
      <v-card-title style="background:#00b3e3 !important;color: #fff">
        <span class="headline">公众号配置明细</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="baseForm" lazy-validation>
         <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12 sm4 md5 style="margin-right:10%">
                  <v-autocomplete
                    label="支持通道" hide-details
                    v-model="baseFormData.chnlcode"
                    :hint="`${select.value}, ${select.name}`"
                    :items="chnlcode"
                    item-text="value"
                    item-value="name"
                    :rules="formRules.emptyRules"
                  >
                  </v-autocomplete>
              </v-flex>
              <v-flex xs12 sm6 md5>
                <v-autocomplete
                    label="关注归属" hide-details
                    v-model="baseFormData.belong"
                    :hint="`${select.value}, ${select.name}`"
                    :items="belongArray"
                    item-text="value"
                    item-value="name"
                  >
                </v-autocomplete>
              </v-flex>
              <v-flex xs12 sm6 md5 style="margin-right:10%">
                <v-autocomplete
                    label="配置类型" hide-details
                    v-model="baseFormData.confmodel"
                    @change="sessShowControl"
                    :hint="`${select.value}, ${select.name}`"
                    :items="confmodelArray"
                    item-text="value"
                    item-value="name"
                    :rules="formRules.emptyRules"
                  >
                </v-autocomplete>
              </v-flex>
              <v-flex xs12 sm6 md5>
                <v-text-field :disabled="sessShow" label="小程序密钥" v-model="baseFormData.appkey"/>
              </v-flex>
              <v-flex xs12 sm6 md5 style="margin-right:10%">
                <v-text-field label="商户ID" v-model="baseFormData.uid"/>
              </v-flex>
              <v-flex xs12 sm6 md5>
                <v-text-field label="主体名称" :rules="formRules.emptyRules" v-model="baseFormData.main"/>
              </v-flex>
              <v-flex xs12 sm6 md5 style="margin-right:10%">
                <v-text-field label="微信渠道号" :rules="formRules.emptyRules" v-model="baseFormData.cid"/>
              </v-flex>
              <v-flex xs12 sm6 md5>
                <v-text-field label="支付APPID" :rules="formRules.emptyRules" v-model="baseFormData.pay_appid"/>
              </v-flex>
              <v-flex xs12 sm6 md5 style="margin-right:10%">
                <v-text-field label="支持目录" :rules="formRules.emptyRules" v-model="baseFormData.menu"/>
              </v-flex>
              <v-flex xs12 sm6 md5 class="appNameInput">
                <v-text-field v-if="appNameInput" label="公众号名称" v-model="baseFormData.appname"/>
                <v-autocomplete
                    v-else
                    label="公众号名称" hide-details
                    :disabled="appnameDisabled"
                    v-model="baseFormData.appname"
                    :items="appsArray"
                    @change="appidControl"
                  >
                </v-autocomplete>
                <v-btn @click="appnameInputControl()" flat icon color="info" v-if="iconShow">
                  <v-icon>autorenew</v-icon>
                </v-btn>
              </v-flex>
              <v-flex xs12 sm6 md5 style="margin-right:10%">
                <v-text-field :disabled="appidInputControl" label="公众号APPID" v-model="baseFormData.appid"/>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" flat @click="close()">关闭</v-btn>
        <v-btn color="primary" @click="submit()">提交</v-btn>
      </v-card-actions>
    </v-card>
    </v-dialog>
  </div>
</template>

<script>
// @ is an alias to /src
import qs from 'qs'
export default {
  data () {
    return {
      select: { name: '', value: '' },
      // 公众号下拉框的数据
      apps: {},
      appsArray: [],
      // 通道的下拉框的数据
      chnlcode: [],
      chnlcodeObject: {},
      // 关注归属的下拉框数据
      belong: {},
      belongArray: [],
      // 配置类型的下拉框数据
      confmodel: {},
      confmodelArray: [],
      // 上面搜索条件表单的配置
      searchParams: {
        appname: '',
        main: '',
        appid: '',
        cid: '',
        uid: ''
      },
      // 分页页数的选择
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
      // 列表表头的配置
      headers: [
        { text: '主体名称', value: 'main', sortable: false },
        { text: '微信渠道号', value: 'cid', sortable: false },
        { text: '支付APPID', value: 'pay_appid', sortable: false },
        { text: '支付目录', value: 'menu', sortable: false },
        { text: '公众号名称', value: 'appname', sortable: false },
        { text: '公众号APPID', value: 'appid', sortable: false },
        { text: '商户ID', value: 'uid', sortable: false },
        { text: '支付通道', value: 'chnlcode', sortable: false },
        { text: '公众号归属', value: 'belong', sortable: false },
        { text: '配置类型', value: 'confmodel', sortable: false },
        { text: '操作', value: 'status', sortable: false }
      ],
      isPending: false,
      // 列表数据数组
      desserts: [],
      total: 10,
      page: 1,
      pageSize: 10,
      // 控制对话框的显示
      isShowDialog: false,
      baseFormData: {
        id: '',
        chnlcode: '',
        belong: '',
        confmodel: '',
        appkey: '',
        uid: '',
        main: '',
        cid: '',
        pay_appid: '',
        menu: '',
        appname: '',
        appid: ''
      },
      // 控制小程序密钥是否支持输入
      sessShow: false,
      kind: 'POST',
      // 控制公众号是否支持编辑
      appNameInput: false,
      iconShow: false,
      appidInputControl: false,
      // 编辑功能的标识
      isEdited: false,
      // 控制公众号下拉框是否支持编辑
      appnameDisabled: false,
      formRules: {
        emptyRules: [
          v => !!v || '该字段不能为空'
        ],
        numberRules: [
          v => !isNaN(Number(v)) || '该字段不能为空'
        ]
      }
    }
  },
  created () {
    this.fetchData()
    this.appData()
  },
  methods: {
    // 查询按钮方法
    search () {
      this.pageSize = 10
      this.page = 1
      console.log(this.select)
      this.fetchData()
    },
    // 列表数据请求的方法
    fetchData () {
      this.isPending = true
      let params = {
        size: this.pageSize,
        page: this.page - 1 // 第一页 page = 0
      }
      this.searchParams.chnlcode = this.select.name
      Object.assign(params, this.searchParams)
      this.$http({
        url: '/solar/v1/oper/mpconf/list',
        method: 'GET',
        params
      }).then(res => {
        this.isPending = false
        this.desserts = res.list
        this.total = res.total
      })
    },
    // 公众号和渠道等下拉框的数据请求方法
    appData () {
      this.$http({
        url: '/solar/v1/oper/mpconf/configs',
        method: 'GET'
      }).then(res => {
        this.apps = res.apps
        this.appsArray = Object.keys(res.apps)
        this.belong = res.belong
        this.belongArray = this.arrayTran(res.belong)
        this.chnlcode = res.chnlcode
        this.chnlcodeObject = this.objTran(res.chnlcode)
        this.confmodel = res.confmodel
        this.confmodelArray = this.arrayTran(res.confmodel)
      })
    },
    // 新增按钮对应的方法
    addPublic () {
      this.isShowDialog = true
      this.appNameInput = false
      // 下面俩个布尔值控制是否可编辑
      this.appnameDisabled = false
      this.appidInputControl = false
      // 编辑与下拉框的按钮
      this.iconShow = false
      // 编辑的标示至为false 意为新增
      this.isEdited = false
      this.kind = 'POST'
      this.reset()
    },
    // 字典转数组的方法
    arrayTran(json) {
      let array = []
      let keys = Object.keys(json)
      let values = Object.values(json)
      for (let i in keys) {
        let item = {
          name: +keys[i],
          value: values[i]
        }
        array.push(item)
      }
      return array
    },
    // 数组转字典的方法
    objTran(json) {
      let c = {}
      for (let i of json) {
        let key = i.name
        c[key] = i.value
      }
      return c
    },
    // 控制小程序的输入框是否支持输入
    sessShowControl() {
      // 控制小程序密钥是否支持输入
      this.sessShow = this.baseFormData.confmodel === 1
      this.iconShow = this.baseFormData.confmodel === 2 && !this.isEdited
      this.appidInputControl = this.baseFormData.confmodel === 2 && this.isEdited
      if (this.baseFormData.confmodel === 1) {
        this.baseFormData.appkey = ''
      }
    },
    // 选择下拉框中的公众号之后会有对应的appid
    appidControl() {
      this.baseFormData.appid = this.apps[this.baseFormData.appname]
      if (this.baseFormData.appid) {
        this.appidInputControl = true
      }
    },
    // 对话框关闭
    close() {
      this.isShowDialog = false
    },
    // 对话框的表单提交
    submit() {
      if (!this.$refs.baseForm.validate()) {
        return false
      }
      this.$http({
        url: '/solar/v1/oper/mpconf/info',
        method: this.kind,
        data: { ...this.baseFormData }
      }).then(res => {
        if (res === 'error') {
          return false
        }
        this.isShowDialog = false
        this.appData()
        this.fetchData()
      })
    },
    changeDetails(item) {
      // 对话框展示
      this.isShowDialog = true
      // 编辑标识至为true
      this.isEdited = true
      // appid不能编辑
      this.appidInputControl = true
      // appname不能编辑
      this.appNameInput = false
      this.appnameDisabled = true
      // 对话框选择和输入框的切换按钮不显示
      this.iconShow = false
      // 控制是修改还是新增
      this.kind = 'PUT'
      this.baseFormData = { ...item }
      this.baseFormData = Object.assign(this.baseFormData, {
        chnlcode: +item.chnlcode
      })
      this.sessShow = this.baseFormData.confmodel === 1
    },
    reset() {
      this.$refs.baseForm.reset()
    },
    appnameInputControl() {
      this.appNameInput = !this.appNameInput
      this.baseFormData.appname = ''
      this.baseFormData.appid = ''
      this.appidInputControl = false
    },
    downExcel() {
      let params = {
        mode: 'expo_excel',
        size: this.pageSize,
        page: this.page - 1 // 第一页 page = 0
      }
      Object.assign(params, this.searchParams)
      let agencyHost = process.env.NODE_ENV === 'development' ? '/host' : ''
      window.location.href = `${agencyHost}` + `/solar/v1/oper/mpconf/list?${qs.stringify(params)}`
    },
    reSearch() {
      this.$refs.searchForm.reset()
      // this.searchParams.appname = ""
      // this.searchParams.appid = ""
      // this.searchParams.cid = ""
      // this.searchParams.uid = ""
      // this.searchParams.main = ""
      this.fetchData()
    }
  }
}
</script>

<style lang="scss" scoped>
  .uploadImage {
    vertical-align: top;
  }
  .search-form {
    margin-top: 20px;
    padding: 12px 20px;
    background-color: #fff;
    .v-text-field {
      width: 240px;
      margin-right: 30px;
      margin-bottom: 15px;
      display: inline-block;
      vertical-align: top;
    }
  }
  .production-dialog .v-form {
    background-color: #fff;
    padding: 20px;
  }
  .oper .v-card__title {
    text-align: center;
  }
  .appNameInput {
    position: relative;
    .v-btn {
      position: absolute;
      right: -40px;
      top: 6px;
    }
  }
</style>
