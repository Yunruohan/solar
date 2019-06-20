<template>
  <div>
    <v-card flat class="mt-2">
      <v-layout justify-space-between class="p-b-8">
        <v-form ref="searchForm" class="f-wrap">
          <v-text-field v-model="searchForm.userid" label="商户ID" class="t-f"></v-text-field>
          <v-text-field v-model="searchForm.batch_id" label="批次号" class="t-f"></v-text-field>
          <v-select v-model="searchForm.chnlid" :items="chnlList" item-text="name" item-value="id" no-data-text="暂无数据" placeholder="请选择通道名称" label="通道名称" clearable class="t-f"></v-select>
          <v-select v-model="searchForm.state" :items="stateList" item-text="name" item-value="id" no-data-text="暂无数据" placeholder="请选择状态" label="状态" clearable class="t-f"></v-select>
          <v-text-field v-model="searchForm.mchntid" label="MID/PID" class="t-f"></v-text-field>
          <v-text-field v-model="searchForm.sub_mch_id" label="终端号" class="t-f"></v-text-field>
          <el-date-picker
            v-model="searchForm.ctime"
            type="daterange"
            start-placeholder="开始"
            end-placeholder="结束"
            value-format="yyyy-MM-dd HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']">
          </el-date-picker>
          <v-btn @click="query" color="primary" :loading="queryLoading">查找</v-btn>
          <v-btn @click="add" color="primary">创建</v-btn>
          <v-btn @click="exportExcel" color="primary">导出</v-btn>
          <v-btn @click="update" color="primary" :disabled="updateDisable">更新</v-btn>
        </v-form>
      </v-layout>
      <v-data-table :headers="headers" :items="list" hide-actions class="elevation-1" :loading="loading" :no-data-text="nodatatext" item-key="id">
        <template slot="items" slot-scope="props">
          <td class="text-xs-center">{{ props.item.userid }}</td>
          <td class="text-xs-center">{{ props.item.chnlname }}</td>
          <td class="text-xs-center">{{ props.item.mchntid }}</td>
          <td class="text-xs-center">{{ props.item.batch_id }}</td>
          <td class="text-xs-center">{{ props.item.secondary_mchntid }}</td>
          <td class="text-xs-center">{{ props.item.sub_mch_id }}</td>
          <td class="text-xs-center">{{ props.item.unify_mcc }}</td>
          <td class="text-xs-center">
            <v-btn color="primary" @click="showDia(props.item.req_info)">请求信息</v-btn>
          </td>
          <td class="text-xs-center">{{ props.item.state }}</td>
          <td class="text-xs-center">{{ props.item.errmsg }}</td>
          <td class="text-xs-center">{{ props.item.ctime }}</td>
          <td class="text-xs-center">{{ props.item.utime }}</td>
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
    <!-- 创建 -->
    <v-dialog v-model="addDia" class="dia-modal" persistent>
      <v-card class="f-card" d-flex>
        <v-form ref="addForm">
          <v-textarea label="商户ID" v-model="addForm.userid" hint="多个以英文逗号或者换行符隔开" :rules="addFormRule.userid" outline></v-textarea>
          <v-select v-model="addForm.d1f" :items="dict1F" item-text="id" item-value="name" no-data-text="暂无数据" placeholder="请选择通道" label="进件通道" clearable class="t-f" :rules="addFormRule.d1f" @change="d1Change"></v-select>
          <v-select v-model="addForm.d2f" :items="dict2F[addForm.d1f]" item-text="id" item-value="name" no-data-text="暂无数据" placeholder="请选择地区" label="地区" clearable class="t-f" :rules="addFormRule.d2f" @change="d2Change"></v-select>
          <v-select v-model="addForm.d3f" :items="dict3F" item-text="id" item-value="name" no-data-text="暂无数据" placeholder="请选择线上/线下" label="线上/线下" clearable class="t-f" :rules="addFormRule.d3f" @change="getConfig"></v-select>
          <v-select v-model="addForm.d4f" :items="dict4F" item-text="id" item-value="name" no-data-text="暂无数据" placeholder="请选择直连/二清" label="直连/二清" clearable class="t-f" :rules="addFormRule.d4f" @change="getConfig"></v-select>
          <v-select v-model="addForm.d5f" :items="dict5F[addForm.d1f ? addForm.d1f : '支付宝'][addForm.d2f]" item-text="id" item-value="name" no-data-text="暂无数据" placeholder="请选择其他条件" label="其他条件" clearable class="t-f" :rules="addFormRule.d5f" @change="getConfig"></v-select>
          <v-text-field v-model="addForm.qf_pid" label="MID/PID" :rules="addFormRule.qf_pid" disabled></v-text-field>
          <v-text-field v-model="addForm.chnlname" label="通道名称" :rules="addFormRule.chnlname" disabled></v-text-field>
          <v-text-field v-model="batch_id" label="批次号" disabled></v-text-field>
          <div>
            <v-btn @click="submit" color="primary">进件</v-btn>
            <v-btn @click="record" color="primary">进件记录</v-btn>
            <v-btn @click="cancel">取消</v-btn>
          </div>
        </v-form>
        <v-data-table :headers="errHeaders" :items="errmsgList" hide-actions class="elevation-1 m-t-10" v-if="errmsgList.length">
          <template slot="items" slot-scope="props">
            <td class="text-xs-center">{{ props.item.uid }}</td>
            <td class="text-xs-center">{{ props.item.errmsg }}</td>
          </template>
        </v-data-table>
      </v-card>
    </v-dialog>
    <!-- 查看请求信息 -->
    <v-dialog v-model="dia" class="dia-modal">
      <v-card class="pa-0 tx-center" d-flex>
        <div class="req-info">{{reqinfo}}</div>
      </v-card>
    </v-dialog>
    <!-- excel -->
    <iframe :src="src" frameborder="0" style="display: none;"></iframe>
  </div>
</template>
<script>
import Http from '@/http'
export default {
  data () {
    return {
      headers: [
        { text: '商户ID', align: 'center', sortable: false },
        { text: '通道名称', align: 'center', sortable: false },
        { text: 'MID/PID', align: 'center', sortable: false },
        { text: '批次号', align: 'center', sortable: false },
        { text: '总店ID', align: 'center', sortable: false },
        { text: '终端号', align: 'center', sortable: false },
        { text: 'mcc', align: 'center', sortable: false },
        { text: '请求信息', align: 'center', sortable: false },
        { text: '状态', align: 'center', sortable: false },
        { text: '错误信息', align: 'center', sortable: false },
        { text: '创建时间', align: 'center', sortable: false },
        { text: '更新时间', align: 'center', sortable: false }
      ],
      list: [],
      loading: false,
      totalItems: 0,
      page: 1,
      pageCount: 10,
      nodatatext: '正在加载',
      searchForm: {
        userid: '',
        batch_id: '',
        chnlid: '',
        state: '',
        mchntid: '',
        sub_mch_id: '',
        ctime: ''
      },
      chnlList: [
        { id: 20, name: 'weixin' },
        { id: 52, name: 'weixin_dcc' },
        { id: 268, name: 'weixin_my' },
        { id: 62, name: 'alipay_global' },
        { id: 151, name: 'alipay_hk' },
        { id: 187, name: 'alipay_global_dcc' },
        { id: 214, name: 'alipay_global_preauth' }
      ],
      stateList: [
        { id: 0, name: '进件中' },
        { id: 1, name: '进件成功' },
        { id: 2, name: '进件失败' }
      ],
      queryLoading: false,
      addDia: false,
      dia: false,
      addForm: {
        userid: '',
        d1f: '',
        d2f: '',
        d3f: '',
        d4f: '',
        d5f: '',
        qf_pid: '',
        chnlname: ''
      },
      addFormRule: {
        userid: [v => !!v || '请填写商户ID'],
        d1f: [v => !!v || '请选择通道'],
        d2f: [v => !!v || '请选择地区'],
        d3f: [v => !!v || '请选择线上/线下'],
        d4f: [v => !!v || '请选择直连/二清'],
        d5f: [v => !!v || '请选择其他条件'],
        qf_pid: [v => !!v || '请填写MID/PID'],
        chnlname: [v => !!v || '请填写通道名称']
      },
      dict1F: [
        { id: '微信', name: '微信' },
        { id: '支付宝', name: '支付宝' },
        { id: '微信融合', name: '微信融合' }
      ],
      dict2F: {
        '微信': [
          {id: '新加坡', name: '新加坡'},
          {id: '日本', name: '日本'},
          {id: '香港', name: '香港'},
          {id: '泰国', name: '泰国'},
          {id: '马来西亚', name: '马来西亚'},
          {id: '缅甸', name: '缅甸'},
          {id: '柬埔寨', name: '柬埔寨'}
        ],
        '微信融合': [
          {id: '香港', name: '香港'}
        ],
        '支付宝': [
          { id: '香港', name: '香港' },
          { id: '柬埔寨', name: '柬埔寨' },
          { id: '老挝', name: '老挝' },
          { id: '印尼', name: '印尼' },
          { id: '迪拜', name: '迪拜' },
          { id: '马来西亚', name: '马来西亚' },
          { id: '新加坡', name: '新加坡' },
          { id: '菲律宾', name: '菲律宾' }
        ]
      },
      dict3F: [
        { id: '线下', name: '线下' },
        { id: '线上', name: '线上' }
      ],
      dict4F: [
        { id: '直连', name: '直连' },
        { id: '二清', name: '二清' }
      ],
      dict5F: {
        '支付宝': {
          '香港': [{ id: '非预授权', name: '非预授权' }],
          '柬埔寨': [
            { id: '非预授权', name: '非预授权' },
            { id: '预授权', name: '预授权' }
          ],
          '老挝': [{ id: '非预授权', name: '非预授权' }],
          '印尼': [{ id: '非预授权', name: '非预授权' }],
          '迪拜': [
            { id: '出租车', name: '出租车' },
            { id: '超市/购物/药房', name: '超市/购物/药房' },
            { id: '酒店/餐厅/食品直接向消费者', name: '酒店/餐厅/食品直接向消费者' },
            { id: '奢侈品', name: '奢侈品' },
            { id: '奢侈品超过2000', name: '奢侈品超过2000' }
          ],
          '马来西亚': [
            { id: '非预授权', name: '非预授权' },
            { id: '预授权', name: '预授权' }
          ],
          '新加坡': [
            { id: '非预授权', name: '非预授权' },
            { id: '预授权', name: '预授权' }
          ],
          '菲律宾': [
            { id: '非预授权', name: '非预授权'}
          ]
        },
        '微信': {
          '新加坡': [
            { id: 'SGD', name: 'SGD' }
          ],
          '日本': [{ id: 'JPY', name: 'JPY' }],
          '香港': [
            { id: 'HKD', name: 'HKD' },
            { id: 'USD', name: 'USD' }
          ],
          '泰国': [{ id: 'THB', name: 'THB' }],
          '马来西亚': [
            { id: 'USD', name: 'USD' },
            { id: 'MYR', name: 'MYR' }
          ],
          '缅甸': [{ id: 'USD', name: 'USD' }],
          '柬埔寨': [{ id: 'USD', name: 'USD' }]
        },
        '微信融合': {
          '香港': [{ id: 'HKD', name: 'HKD' }]
        }
      },
      src: '',
      reqinfo: '',
      batch_id: '',
      errHeaders: [
        { text: '商户ID', align: 'center', sortable: false },
        { text: '错误信息', align: 'center', sortable: false }
      ],
      errmsgList: [],
      updateDisable: false
    }
  },
  methods: {
    async getList() {
      if (this.searchForm.ctime) {
        this.searchForm.ctime_stime = this.searchForm.ctime[0]
        this.searchForm.ctime_etime = this.searchForm.ctime[1]
      }
      this.loading = true
      let res = await Http.get(`/solar/v1/mchnt_global/list`, {
        page: this.page - 1,
        size: this.pageCount,
        userid: this.searchForm.userid,
        batch_id: this.searchForm.batch_id,
        chnlid: this.searchForm.chnlid,
        state: this.searchForm.state,
        mchntid: this.searchForm.mchntid,
        sub_mch_id: this.searchForm.sub_mch_id,
        ctime_stime: this.searchForm.ctime_stime,
        ctime_etime: this.searchForm.ctime_etime
      })
      this.loading = false
      if (res.respcd === '0000') {
        this.list = [...res.data.list]
        this.totalItems = res.data.total
        if (!this.list.length) {
          this.nodatatext = '暂无数据'
        }
      }
    },
    async query() {
      this.queryLoading = true
      this.page = 1
      await this.getList()
      this.queryLoading = false
    },
    add () {
      this.addDia = true
    },
    handleSizeChange(val) {
      this.pageCount = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.page = val
      this.getList()
    },
    exportExcel () {
      this.searchForm.ctime_stime = this.searchForm.ctime ? this.searchForm.ctime[0] : ''
      this.searchForm.ctime_etime = this.searchForm.ctime ? this.searchForm.ctime[1] : ''
      const href = location.hostname === 'localhost' ? 'http://172.100.108.47:2990' : location.origin
      this.$nextTick(() => {
        this.src = `${href}/solar/v1/mchnt_global/list?mode=expo_excel&userid=${this.searchForm.userid}&batch_id=${this.searchForm.batch_id}&chnlid=${this.searchForm.chnlid}&state=${this.searchForm.state}&mchntid=${this.searchForm.mchntid}&sub_mch_id=${this.searchForm.sub_mch_id}&ctime_stime=${this.searchForm.ctime_stime}&ctime_etime=${this.searchForm.ctime_etime}`
      })
    },
    showDia (info) {
      this.dia = true
      this.reqinfo = info
    },
    d1Change () {
      this.addForm.d2f = ''
      this.addForm.d5f = ''
      this.getConfig()
    },
    d2Change () {
      this.addForm.d5f = ''
      this.getConfig()
    },
    async getConfig () {
      const d1f = this.addForm.d1f
      const d2f = this.addForm.d2f
      const d3f = this.addForm.d3f
      const d4f = this.addForm.d4f
      const d5f = this.addForm.d5f
      if (!d1f || !d2f || !d3f || !d4f || !d5f) return
      const keys = `${d1f},${d2f},${d3f},${d4f},${d5f}`
      let res = await Http.get(`/solar/v1/mchnt_global/config?keys=${keys}`)
      if (res.respcd === '0000') {
        this.$set(this.addForm, 'qf_pid', res.data.qf_pid)
        this.$set(this.addForm, 'chnlname', res.data.chnlname)
      }
    },
    async submit () {
      const userids = this.addForm.userid
      const d1f = this.addForm.d1f
      const d2f = this.addForm.d2f
      const d3f = this.addForm.d3f
      const d4f = this.addForm.d4f
      const d5f = this.addForm.d5f
      if (!d1f || !d2f || !d3f || !d4f || !d5f || !userids) return
      const keys = `${d1f},${d2f},${d3f},${d4f},${d5f}`
      let res = await Http.post(`/solar/v1/mchnt_global/info`, {
        userids: userids,
        keys: keys
      })
      if (res.respcd === '0000') {
        this.batch_id = res.data.btch_id
        this.errmsgList = res.data.errmsg
        this.$store.dispatch('setSnackbar', {
          showSnackbar: true,
          snackbarText: '操作成功',
          snackbarColor: 'success'
        })
      }
    },
    record () {
      this.searchForm.batch_id = this.batch_id
      this.cancel()
      this.getList()
    },
    cancel () {
      Object.keys(this.addForm).map(item => {
        this.addForm[item] = ''
      })
      this.batch_id = ''
      this.errmsgList = []
      this.addDia = false
    },
    addDateZero (n) {
      n = n + ''
      n = n.length == 1 ? `0${n}` : n
      return n
    },
    async update () {
      if (!this.searchForm.ctime) {
        this.$store.dispatch('setSnackbar', {
          showSnackbar: true,
          snackbarText: '请选择时间范围',
          snackbarColor: 'error'
        })
        return
      }
      const ctime_stime = new Date(this.searchForm.ctime[0])
      const ctime_etime = new Date(this.searchForm.ctime[1])
      const t_range = Math.floor((ctime_etime.getTime() - ctime_stime.getTime()) /(24 * 60 * 60 * 1000))
      if (t_range < 3) {
        let res = await Http.get(`/solar/v1/mchnt_global/query`, {
          ctime_stime: this.searchForm.ctime[0],
          ctime_etime: this.searchForm.ctime[1],
          state: 0
        })
        if (res.respcd === '0000') {
          this.updateDisable = true
          this.$store.dispatch('setSnackbar', {
            showSnackbar: true,
            snackbarText: '操作成功，请至少10分钟后再进行更新操作',
            snackbarColor: 'success'
          })
        }
        
      } else {
        this.$store.dispatch('setSnackbar', {
          showSnackbar: true,
          snackbarText: '更新操作的时间不能超过三天',
          snackbarColor: 'error'
        })
      }
    }
  },
  created () {
    const dt = new Date()
    this.searchForm.ctime_stime = `${dt.getFullYear()}-${this.addDateZero(dt.getMonth() + 1)}-${dt.getDate()} 00:00:00`
    this.searchForm.ctime_etime = `${dt.getFullYear()}-${this.addDateZero(dt.getMonth() + 1)}-${dt.getDate()} 23:59:59`
    this.getList()
  }
}
</script>
<style lang="scss" scoped>
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
.f-card{
  padding: 10px 50px;
}
.req-info{
  word-break: break-all;padding: 15px;
}
.m-t-10{
  margin-top: 10px;
}
</style>


