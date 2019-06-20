<template>
  <div class="orgs">
    <v-layout align-center justify-space-between>
      <v-form ref="searchForm" class="search-form">
        <v-text-field label="服务商简称" hide-details v-model="searchParams.short_name"/>
        <v-text-field label="登录账号" hide-details v-model="searchParams.username"/>
        <v-select
          label="状态" hide-details
          :items="searchFormStatus"
          v-model="searchParams.status"
          no-data-text="暂无数据"
        >
        </v-select>
        <v-btn @click="search()" color="primary">查找</v-btn>
      </v-form>
      <v-btn @click="openOrgDialog()" color="primary">添加服务商</v-btn>
    </v-layout>
    <v-data-table
      :headers="headers"
      :items="desserts"
      :loading="isPending"
      hide-actions
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.short_name }}</td>
        <td>{{ props.item.qd_uid }}</td>
        <td>{{ props.item.username }}</td>
        <td>{{ props.item.type | formatType}}</td>
        <td>{{ props.item.ctime }}</td>
        <td>{{ props.item.utime }}</td>
        <td>
          <v-switch @change="beforeUpdateStatus($event, props.item.qd_uid)" v-model="props.item.status" color="primary" :messages="props.item.status === 0 ? '已启用' : '已停用'"  :true-value="0" :false-value="1"></v-switch>
        </td>
        <td>
          <v-btn flat icon color="primary" class="mx-0" @click="viewDetails(props.item.qd_uid)">
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
        no-data-text="暂无数据"
      ></v-select>
      <v-pagination
        v-model="page"
        @input="fetchData()"
        :length="total === pageSize ? 1 : parseInt(total / pageSize) + 1"
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
        <v-toolbar-title>{{isUpdate ? '修改服务商' : '添加服务商'}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon dark @click.native="isShowDialog = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-expansion-panel v-model="panel" expand>
        <v-expansion-panel-content>
          <div slot="header">基本信息</div>
          <v-form ref="baseForm" lazy-validation>
            <v-text-field label="服务商简称" :rules="formRules.emptyRules" v-model="baseInfo.short_name"/>
            <v-select
              v-model="baseInfo.type"
              :rules="formRules.emptyRules"
              :items="orgTypes"
              item-value="type"
              label="服务商类型"
              no-data-text="暂无数据"
            ></v-select>
            <v-text-field label="服务商名称" :rules="formRules.emptyRules" v-model="baseInfo.name"/>
            <v-text-field label="登录账号" :rules="formRules.emptyRules" v-model="baseInfo.username"/>
            <v-text-field label="登录密码" :append-icon="isShowPassword ? 'visibility_off' : 'visibility'" placeholder="******"
            :type="isShowPassword ? 'password' : 'text'" @click:append="isShowPassword = !isShowPassword" v-model="baseInfo.password"/>
            <v-text-field label="法人姓名" :rules="formRules.emptyRules" v-model="baseInfo.legal_name"/>
            <v-select
              label="状态"
              :items="[{
                text: '启用',
                value: 0
              }, {
                text: '停用',
                value: 1
              }]"
              v-model="baseInfo.status"
              no-data-text="暂无数据"
            >
            </v-select>
            <v-text-field label="联系电话" :rules="formRules.emptyRules" v-model="baseInfo.mobile"/>
            <v-select
              v-model="baseInfo.country"
              :rules="formRules.emptyRules"
              :items="countrys"
              item-value="code"
              label="国家"
              no-data-text="暂无数据"
            ></v-select>
            <v-text-field label="联系邮箱" :rules="formRules.emptyRules" v-model="baseInfo.email"/>
            <v-select
              v-model="baseInfo.currency"
              :rules="formRules.emptyRules"
              :items="currencys"
              item-value="code"
              label="币种"
              no-data-text="暂无数据"
            ></v-select>
            <v-text-field label="公司地址" :rules="formRules.emptyRules" v-model="baseInfo.address"/>
            <v-select
              v-model="baseInfo.timezone"
              :rules="formRules.emptyRules"
              :items="timezones"
              label="时区"
              no-data-text="暂无数据"
            ></v-select>
          </v-form>
        </v-expansion-panel-content>
        <v-expansion-panel-content>
          <div slot="header">财务信息</div>
          <v-form ref="financeForm" lazy-validation>
            <v-text-field label="开户名称" :rules="formRules.emptyRules" v-model="financeInfo.account_name"/>
            <v-text-field label="开户银行名称" :rules="formRules.emptyRules" v-model="financeInfo.bank_name"/>
            <v-text-field label="银行账号" :rules="formRules.emptyRules" v-model="financeInfo.bank_account"/>
            <v-text-field label="银行所在国别" :rules="formRules.emptyRules" v-model="financeInfo.bank_country"/>
            <v-text-field label="SWIFT CODE" :rules="formRules.emptyRules" v-model="financeInfo.swift_code"/>
            <v-text-field label="支行名称" :rules="formRules.emptyRules" v-model="financeInfo.brchbank_name"/>
            <v-text-field label="IBAN No." :rules="formRules.emptyRules" v-model="financeInfo.iban"/>
            <v-text-field label="支行代码" :rules="formRules.emptyRules" v-model="financeInfo.brchbank_code"/>
          </v-form>
        </v-expansion-panel-content>
        <v-expansion-panel-content>
          <div slot="header">产品信息</div>
          <v-layout align-center justify-end>
            <v-btn color="primary" @click="openProductionDialog()">添加通道</v-btn>
          </v-layout>
          <v-data-table
            :headers="productionHeaders"
            :items="productions"
            hide-actions
            class="elevation-1"
          >
            <template slot="items" slot-scope="props">
              <td>{{ props.item.chnlname }}</td>
              <td>{{ props.item.trade_name }}</td>
              <td>{{ props.item.ratio }}</td>
              <td>{{ props.item.fix_fee }}分</td>
              <td>
                <v-switch @change="changeProductionStatus($event, props.item.chnlcode, props.item.trade_type)" v-model="props.item.status" color="primary" :messages="props.item.status === 1 ? '已启用' : '已停用'"  :true-value="1" :false-value="0"></v-switch>
              </td>
              <td>
                <v-btn flat icon color="primary" class="mx-0" @click="editProductionDialog(props.index, props.item)">
                  <v-icon small>edit</v-icon>
                </v-btn>
                <v-btn v-if="!isUpdate" flat icon color="primary" class="mx-0" @click="deleteProduction(props.item.chnlcode)">
                  <v-icon small>highlight_off</v-icon>
                </v-btn>
              </td>
            </template>
            <template slot="no-data">
              <p style="text-align:center;padding-top:16px;">暂无数据</p>
            </template>
          </v-data-table>
        </v-expansion-panel-content>
        <!--
          <uploadImage :src="photos.id" label="法人身份证正面" ref="idUpload"/>
          <uploadImage :src="photos.reverseId" label="法人身份证反面" ref="reverseIdUpload"/>
          <uploadImage :src="photos.company" label="公司注册证书" ref="companyUpload"/>
          <uploadImage :src="photos.business" label="商业登记证" ref="businessUpload"/>
         -->
      </v-expansion-panel>
      <v-btn color="primary" @click="submitOrg()" class="mx-5 my-3">保存</v-btn>
    </v-dialog>
    <v-dialog
      v-model="isShowProductionDialog"
      max-width="500px"
      content-class="production-dialog"
    >
      <v-toolbar card dark color="primary">
        <v-toolbar-title>{{isUpdateProduction ? '修改通道' : '添加通道'}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon dark @click.native="isShowProductionDialog = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-form ref="productionForm" lazy-validation>
        <v-select
          ref="channel"
          label="通道"
          :items="channels"
          :disabled="isUpdateProduction"
          item-value="chnlcode"
          @change="selectChannel"
          v-model="channelInfo.chnlcode"
          :rules="formRules.emptyRules"
          no-data-text="暂无数据"
        ></v-select>
        <v-select
          label="产品"
          :items="channelTrades"
          :disabled="isUpdateProduction"
          item-text="name"
          item-value="trade_type"
          v-model="channelInfo.trade_type"
          :rules="formRules.emptyRules"
          no-data-text="暂无数据"
        ></v-select>
        <v-text-field
          v-model.number="channelInfo.ratio"
          label="费率成本"
          placeholder="示例：0.38%填写0.0038"
          type="number"
          :rules="formRules.numberRules"
        ></v-text-field>
        <v-text-field
          v-model.number="channelInfo.fix_fee"
          label="固定值成本"
          type="number"
          suffix="分"
          :rules="formRules.numberRules"
        ></v-text-field>
        <v-btn color="primary" @click="saveProduction()">保存</v-btn>
      </v-form>
    </v-dialog>
    <comfirm @okHandler="updateStatus()" @cancelHandler="cancelUpdateStatus()" :isVisiable="showComfirm" :msg="currentItem.status === 0 ? '确定启用吗？' : '确定停用吗？'" />
  </div>
</template>

<script>
// @ is an alias to /src
import UploadImage from '../components/uploadImage'
import Comfirm from '@/components/Comfirm'
import qs from 'qs'
import timezones from '../utils/timezones'
export default {
  components: {
    UploadImage,
    Comfirm
  },
  data () {
    return {
      searchFormStatus: [{
        value: '',
        text: '全部'
      }, {
        value: 0,
        text: '启用'
      }, {
        value: 1,
        text: '停用'
      }],
      searchParams: {
        short_name: '',
        status: '',
        qd_uid: ''
      },
      headers: [
        { text: '服务商简称', value: 'short_name', sortable: false },
        { text: '服务商ID', value: 'qd_uid', sortable: false },
        { text: '登录账号', value: 'username', sortable: false },
        { text: '服务商类型', value: 'type', sortable: false },
        { text: '创建时间', value: 'ctime', sortable: false },
        { text: '更新时间', value: 'utime', sortable: false },
        { text: '状态', value: 'status', sortable: false },
        { text: '详情', value: 'id', sortable: false }
      ],
      isPending: false,
      desserts: [],
      total: 10,
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
      isShowDialog: false, // 新增机构弹框
      isReadonly: false, // 查看，详细
      isUpdate: false, // 修改
      panel: [true, true, true],
      currencys: [], // 币种
      countrys: [], // 国家
      orgTypes: [], // 服务商类型
      channels: [], // 通道
      baseInfo: { // step1 基本信息
        username: '',
        mobile: '',
        currency: ''
      },
      isShowPassword: false,
      formRules: {
        emptyRules: [
          v => !!v || '该字段不能为空'
        ],
        numberRules: [
          v => !isNaN(Number(v)) || '该字段不能为空'
        ]
      },
      financeInfo: {},
      // photosValid: false,
      // photos: {
      //   id: '',
      //   reverseId: '',
      //   company: '',
      //   business: ''
      // },
      productionHeaders: [
        { text: '通道', value: 'chnlname', sortable: false },
        { text: '产品', value: 'trade_name', sortable: false },
        { text: '费率成本', value: 'ratio', sortable: false },
        { text: '固定值成本', value: 'fix_fee', sortable: false },
        { text: '状态', value: 'status', sortable: false },
        { text: '操作', value: 'operate', sortable: false }
      ],
      productions: [],
      isShowProductionDialog: false,
      isUpdateProduction: false, // 编辑产品
      currentChannelIndex: 0,
      channelInfo: {},
      channelFormRulse: {},
      channelTrades: [] // 通道下的所有产品(交易方式)
    }
  },
  filters: {
    formatType (number) {
      let typeString = number === 1 ? '服务商(具有商户入网、资金结算能力)' : ''
      return typeString
    }
  },
  created () {
    this.timezones = timezones
    this.fetchData()
  },
  methods: {
    search () {
      this.pageSize = 10
      this.page = 1
      this.fetchData()
    },
    fetchData () {
      this.isPending = true
      let params = {
        size: this.pageSize,
        page: this.page - 1 // 第一页 page = 0
      }
      Object.assign(params, this.searchParams)
      this.$http({
        url: '/solar/v1/org/user/list',
        method: 'GET',
        params
      }).then(res => {
        this.isPending = false
        this.desserts = res.list
        this.total = res.total
      })
    },
    openOrgDialog () {
      this.$refs.baseForm.reset()
      this.$refs.financeForm.reset()
      this.productions = []
      this.isShowDialog = true
      this.isUpdate = false
      this.getConfigs()
    },
    getConfigs () {
      this.$http({
        url: '/solar/v1/org/configs',
        method: 'GET'
      }).then(res => {
        this.currencys = res.currency
        this.countrys = res.country
        this.orgTypes = res.org_type
        this.channels = res.chnl
      })
    },
    channelName (code) {
      let channelName = ''
      this.channels.map((item) => {
        if (item.chnlcode === code) {
          channelName = item.text
        }
      })
      return channelName
    },
    productionName (type) {
      let productionName = ''
      this.channelTrades.map((item) => {
        if (item.trade_type === type) {
          productionName = item.name
        }
      })
      return productionName
    },
    selectChannel (value) {
      this.$http({
        url: '/solar/v1/org/trade_types',
        method: 'GET',
        params: {
          chnlcode: value
        }
      }).then(res => {
        this.channelTrades = res
      })
    },
    openProductionDialog () {
      this.isShowProductionDialog = true
      this.isUpdateProduction = false
      this.$refs.productionForm.reset()
      // this.channelInfo = {}
    },
    editProductionDialog (index, production) {
      this.isShowProductionDialog = true
      this.isUpdateProduction = true
      this.selectChannel(production.chnlcode)
      this.currentChannelIndex = index
      this.channelInfo = { ...production }
    },
    saveProduction () {
      if (!this.$refs.productionForm.validate()) {
        return false
      }
      let channelInfo = { ...this.channelInfo }
      channelInfo.chnlname = this.channelName(channelInfo.chnlcode)
      channelInfo.trade_name = this.productionName(channelInfo.trade_type)
      channelInfo.status = 1
      if (this.isUpdateProduction) {
        this.$set(this.productions, this.currentChannelIndex, channelInfo)
        this.isShowProductionDialog = false
      } else {
        let productionFormValid = true
        this.productions.map((item) => {
          if (channelInfo.chnlcode === item.chnlcode && channelInfo.trade_type === item.trade_type) {
            this.$emit('toast', '设置了相同的支付产品', 'error')
            productionFormValid = false
          }
        })
        if (productionFormValid) {
          this.productions.push(channelInfo)
          this.isShowProductionDialog = false
        }
      }
    },
    deleteProduction (code) {
      this.productions.map((item, index) => {
        if (item.chnlcode === code) {
          this.productions.splice(index, 1)
        }
      })
    },
    changeProductionStatus (value, code, tradetype) {
      this.productions.map((item) => {
        if (item.chnlcode === code && item.trade_type === tradetype) {
          item.status = value
        }
      })
    },
    viewDetails (userid) {
      this.currentItem.id = userid
      this.getConfigs()
      this.$http({
        url: '/solar/v1/org/user/info',
        method: 'GET',
        params: {
          userid
        }
      }).then(res => {
        this.isShowDialog = true
        this.isUpdate = true
        this.isReadonly = true
        this.baseInfo = {
          short_name: res.short_name,
          type: res.type,
          name: res.name,
          username: res.username,
          legal_name: res.legal_name,
          status: res.status,
          mobile: res.mobile,
          country: res.country,
          email: res.email,
          currency: res.currency,
          address: res.address,
          timezone: res.timezone
        }
        this.financeInfo = {
          account_name: res.account_name,
          bank_name: res.bank_name,
          bank_account: res.bank_account,
          bank_country: res.bank_country,
          swift_code: res.swift_code,
          brchbank_name: res.brchbank_name,
          iban: res.iban,
          brchbank_code: res.brchbank_code
        }
        this.productions = res.chnlinfos
      })
    },
    submitOrg () {
      if (!this.$refs.baseForm.validate() || !this.$refs.financeForm.validate()) {
        return false
      }
      let params = Object.assign(this.baseInfo, this.financeInfo, {
        chnlinfos: this.productions
      })
      if (this.isUpdate) {
        params.userid = this.currentItem.id
      }
      this.$http({
        url: '/solar/v1/org/user/info',
        method: this.isUpdate ? 'PUT' : 'POST',
        data: params
      }).then(response => {
        if (response === 'error') {
          return false
        }
        this.isShowDialog = false
        let msg = this.isUpdate ? '修改成功' : '创建成功'
        this.$emit('toast', msg, 'success')
        if (!this.isUpdate) {
          // 创建成功，刷新列表 重置筛选和分页
          this.$refs.searchForm.reset()
          this.search()
        } else {
          // 编辑成功，刷新列表
          this.fetchData()
        }
      })
    },
    beforeUpdateStatus (status, id) {
      this.showComfirm = true
      this.currentItem = {
        status,
        id
      }
    },
    cancelUpdateStatus () {
      this.showComfirm = false
      this.desserts.map((item) => {
        if (item.qd_uid === this.currentItem.id) {
          item.status = this.currentItem.status === 1 ? 0 : 1 // 取消之后，重置原值
        }
      })
    },
    updateStatus () {
      this.$http({
        url: '/solar/v1/org/user/info',
        method: 'PUT',
        data: qs.stringify({
          userid: this.currentItem.id,
          status: this.currentItem.status
        })
      }).then(response => {
        this.showComfirm = false
        this.showSnackbar = true
        this.snackbarText = '修改状态成功'
      })
    }
  }
}
</script>

<style lang="scss">
  .uploadImage {
    vertical-align: top;
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
  .production-dialog .v-form {
    background-color: #fff;
    padding: 20px;
  }
</style>
