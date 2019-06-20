<template>
  <div>
    <v-card flat class="mt-2">
      <v-layout justify-space-between class="p-b-8">
        <v-form ref="searchForm" class="f-wrap">
          <v-text-field v-model="searchForm.userid" label="商户ID" class="t-f"></v-text-field>
          <v-text-field v-model="searchForm.mobile" label="手机号" class="t-f"></v-text-field>
          <v-btn @click="queryList" color="primary" :loading="queryLoading">查询</v-btn>
          <v-btn @click="addMchnt" color="primary">添加分账商户</v-btn>
        </v-form>
      </v-layout>
      <v-data-table :headers="headers" :items="list" hide-actions class="elevation-1" :loading="loading" :no-data-text="nodatatext" item-key="userid">
        <template slot="items" slot-scope="props">
          <td class="text-xs-center">{{ props.item.userid }}</td>
          <td class="text-xs-center">{{ props.item.name }}</td>
          <td class="text-xs-center">{{ props.item.idnumber }}</td>
          <td class="text-xs-center">{{ props.item.mobile }}</td>
          <td class="text-xs-center">{{ props.item.bankaccount }}</td>
          <td class="text-xs-center">{{ props.item.headbankname }}</td>
          <td class="text-xs-center">{{ props.item.area }}</td>
          <td class="text-xs-center">
            <v-hover>
              <div slot-scope="{ hover }">
                <div>{{ props.item.state }}</div>
                <div v-show="hover">{{props.item.errmsg}}</div>
              </div>
            </v-hover>
          </td>
          <td class="justify-center layout align-center">
            <v-btn color="primary" @click="modify(props.item)">修改</v-btn>
          </td>
        </template>
      </v-data-table>
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageCount"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalItems">
        </el-pagination>
      </div>
    </v-card>
    <!-- 添加分账商户弹框 -->
    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <div class="d-v">
        <div-form :formData="formData" :formRule="formRule" @submit="submit" @cancel="cancel" @getCities="getCities" :provinces="provinces" :cities="cities" :idType="idType" :banks="banks" :isEditing="isEditing" :brBanks="brBanks" @getBrchBanks="getBrchBanks"></div-form>
      </div>
    </v-dialog>
  </div>
</template>
<script>
import Http from '@/http'
import { DivForm } from '../common/index'
export default {
  data () {
    return {
      searchForm: {
        userid: '',
        mobile: ''
      },
      headers: [
        { text: '商户ID', align: 'center', sortable: false, value: 'userid' },
        { text: '姓名', align: 'center', sortable: false },
        { text: '身份证号', align: 'center', sortable: false },
        { text: '手机号', align: 'center', sortable: false },
        { text: '银行卡号', align: 'center', sortable: false },
        { text: '开户行', align: 'center', sortable: false },
        { text: '银行所在省市', align: 'center', sortable: false },
        { text: '进件状态', align: 'center', sortable: false },
        { text: '操作', align: 'center', sortable: false }
      ],
      loading: false,
      list: [],
      nodatatext: '正在加载',
      totalItems: 0,
      page: 1,
      pageCount: 10,
      dialog: false,
      valid: false,
      addForm: {
        name: '',
        mobile: '',
        idnumber: '',
        bankaccount: '',
        bankmobile: '',
        headbankname: '',
        bankProvince: '',
        bankCity: '',
        bankname: ''
      },
      addRule: {
        name: [v => !!v || '请填写姓名'],
        mobile: [v => !!v || '请填写电话'],
        idnumber: [v => !!v || '请填写身份证号'],
        bankaccount: [v => !!v || '请填写银行卡号'],
        bankmobile: [v => !!v || '请填写银行预留手机号'],
        headbankname: [v => !!v || '请选择开户行'],
        bankProvince: [v => !!v || '请选择开户省'],
        bankCity: [v => !!v || '请选择开户城市'],
        bankname: [v => !!v || '请选择开户支行']
      },
      idType: ['身份证'],
      banks: [],
      brBanks: [],
      provinces: [],
      cities: [],
      formData: {},
      formRule: {},
      isEditing: false,
      queryLoading: false,
      addFormCache: ''
    }
  },
  components: {
    DivForm
  },
  methods: {
    addMchnt () {
      this.dialog = true
      this.formData = JSON.parse(this.addFormCache)
      this.formRule = this.addRule
      this.isEditing = false
    },
    async modify (item) {
      this.dialog = true
      this.isEditing = true
      let area = item.area.split('-')
      item.bankProvince = this.provinces.find(_item => _item.area_name === area[0]) ? this.provinces.find(_item => _item.area_name === area[0])['id'] : ''
      let areaNo = this.provinces.find(_item => _item.area_name === area[0]) ? this.provinces.find(_item => _item.area_name === area[0])['area_no'] : ''
      Object.keys(this.addForm).map(_item => {
        this.formData[_item] = item[_item]
      })
      this.formData.headbankname = this.banks.find(_item => _item.headbankname === this.formData.headbankname) ? this.banks.find(_item => _item.headbankname === this.formData.headbankname)['id'] : ''
      await this.getCities()
      this.formData.bankCity = this.cities.find(_item => _item.city_name === area[1]) ? this.cities.find(_item => _item.city_name === area[1])['id'] : ''
      await this.getBrchBanks(areaNo)
      let bankname = this.brBanks.find(_item => _item.brchbank_name === item.bankname) ? this.brBanks.find(_item => _item.brchbank_name === item.bankname)['id'] : ''
      this.$set(this.formData, 'bankname', bankname)
      this.formData.userid = item.userid
      this.formRule = this.addRule
    },
    handleSizeChange(val) {
      this.pageCount = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.page = val
      this.getList()
    },
    async queryList () {
      this.queryLoading = true
      this.page = 1
      await this.getList()
      this.queryLoading = false
    },
    async getList() {
      this.loading = true
      let res = await Http.get(`/solar/v1/mchnt/divmchnt/list?size=${this.pageCount}&page=${this.page - 1}`, this.searchForm)
      this.loading = false
      if (res.respcd === '0000') {
        this.list = res.data.list
        this.totalItems = res.data.total
        if (!this.list.length) {
          this.nodatatext = '暂无数据'
        }
      }
    },
    async getBanks () {
      let res = await Http.get(`/solar/v1/utils/headbank/list`)
      if (res.respcd === '0000') {
        this.banks = [...res.data]
      }
    },
    async getBrchBanks (areaNo) {
      if (!this.formData.headbankname || !this.formData.bankProvince) {
        return
      }
      let aNo = areaNo ? areaNo : (this.provinces.find(item => item.id === this.formData.bankProvince) ? this.provinces.find(item => item.id === this.formData.bankProvince)['area_no'] : '')
      let res = await Http.get(`/solar/v1/utils/brchbank/list`, {
        bank_id: this.formData.headbankname,
        areaid: aNo
      })
      if (res.respcd === '0000') {
        this.brBanks = [...res.data]
      }
    },
    async getProvinces () {
      let res = await Http.get(`/solar/v1/utils/province/list`)
      if (res.respcd === '0000') {
        this.provinces = res.data
      }
    },
    async getCities () {
      this.getBrchBanks()
      let res = await Http.get(`/solar/v1/utils/city/list?area_id=${this.formData.bankProvince}`)
      if (res.respcd === '0000') {
        this.cities = res.data
      }
    },
    cancel () {
      this.clearAddForm()
      this.dialog = false
    },
    async submit () {
      let regMobile = /^1[34578]{1}\d{9}$/
      this.formData.headbankname = this.banks.find(item => item.id === this.formData.headbankname) ? this.banks.find(item => item.id === this.formData.headbankname)['headbankname'] : ''
      this.formData.bankProvince = this.provinces.find(item => item.id === this.formData.bankProvince) ? this.provinces.find(item => item.id === this.formData.bankProvince)['area_name'] : ''
      this.formData.bankCity = this.cities.find(item => item.id === this.formData.bankCity) ? this.cities.find(item => item.id === this.formData.bankCity)['city_name'] : ''
      this.formData.brchbank_code = this.brBanks.find(item => item.id === this.formData.bankname) ? this.brBanks.find(item => item.id === this.formData.bankname)['brchbank_no'] : ''
      this.formData.bankname = this.brBanks.find(item => item.id === this.formData.bankname) ? this.brBanks.find(item => item.id === this.formData.bankname)['brchbank_name'] : ''
      this.formData.bankuser = this.formData.name
      let res = {}
      if (this.isEditing) {
        if (!regMobile.test(this.formData.bankmobile)) {
          this.$store.dispatch('setSnackbar', {
            showSnackbar: true,
            snackbarText: '银行预留手机号码格式错误',
            snackbarColor: 'error'
          })
          return
        }
        let editForm = {
          userid: this.formData.userid,
          bankaccount: this.formData.bankaccount,
          headbankname: this.formData.headbankname,
          bankmobile: this.formData.bankmobile,
          bankProvince: this.formData.bankProvince,
          bankCity: this.formData.bankCity,
          bankname: this.formData.bankname,
          bankuser: this.formData.name,
          brchbank_code: this.formData.brchbank_code
        }
        res = await Http.put(`/solar/v1/mchnt/divmchnt/info`, editForm)
      } else {
        if (!regMobile.test(this.formData.mobile)) {
          this.$store.dispatch('setSnackbar', {
            showSnackbar: true,
            snackbarText: '手机号码格式错误',
            snackbarColor: 'error'
          })
          return
        }
        if (!regMobile.test(this.formData.bankmobile)) {
          this.$store.dispatch('setSnackbar', {
            showSnackbar: true,
            snackbarText: '银行预留手机号码格式错误',
            snackbarColor: 'error'
          })
          return
        }
        res = await Http.post(`/solar/v1/mchnt/divmchnt/info`, this.formData)
      }
      if (res.respcd === '0000') {
        this.$store.dispatch('setSnackbar', {
          showSnackbar: true,
          snackbarText: '添加成功',
          snackbarColor: 'success'
        })
        this.clearAddForm()
        this.dialog = false
        this.getList()
      }
    },
    clearAddForm () {
      this.formData = JSON.parse(this.addFormCache)
    }
  },
  created () {
    this.addFormCache = JSON.stringify(this.addForm)
    this.getList()
    this.getBanks()
    this.getProvinces()
  }
}
</script>
<style scoped>
.p-b-8{
  padding-bottom: 8px;
}
.f-wrap{
  display: flex;
  flex-wrap: wrap;
}
.t-f{
  padding: 8px;
}
.d-v{
  background: #ffffff;min-height: 100vh;padding: 20px;
}
</style>
