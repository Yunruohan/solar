<template>
  <div>
    <v-card flat class="mt-2">
      <v-layout justify-space-between class="p-b-8">
        <v-form ref="searchForm" class="f-wrap">
          <v-text-field v-model="searchForm.groupid" label="渠道ID" class="t-f"></v-text-field>
          <v-select v-model="searchForm.available" :items="availList" item-text="name" item-value="id" no-data-text="暂无数据" placeholder="请选择启用状态" label="启用状态" clearable class="t-f"></v-select>
          <v-text-field v-model="searchForm.userid" label="商户ID" class="t-f"></v-text-field>
          <v-select v-model="searchForm.subsidy_period" :items="periodList" item-text="name" item-value="id" no-data-text="暂无数据" placeholder="请选择返款周期" label="返款周期" clearable class="t-f"></v-select>
          <el-date-picker
            v-model="searchForm.utime"
            type="daterange"
            start-placeholder="更新开始"
            end-placeholder="更新结束"
            value-format="yyyy-MM-dd HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']">
          </el-date-picker>
          <v-btn @click="query" color="primary" :loading="queryLoading">查找</v-btn>
          <v-btn @click="add" color="primary">创建</v-btn>
          <!-- <v-btn @click="exportExcel" color="primary">导出</v-btn> -->
        </v-form>
      </v-layout>
      <v-data-table :headers="headers" :items="list" hide-actions class="elevation-1" :loading="loading" :no-data-text="nodatatext">
        <template slot="items" slot-scope="props">
          <td class="text-xs-center">{{ props.item.groupid }}</td>
          <td class="text-xs-center">{{ props.item.group_name }}</td>
          <td class="text-xs-center">{{ props.item.userid }}</td>
          <td class="text-xs-center">{{ props.item.user_name }}</td>
          <!-- 不能小于100 不能大于9999900 -->
          <td class="text-xs-center">{{ props.item.subsidy_amt/100 }}</td>
          <td class="text-xs-center">{{ props.item.subsidy_period | formatPeriod }}</td>
          <td class="text-xs-center">{{ props.item.utime }}</td>
          <td class="text-xs-center">{{ props.item.start_time }}</td>
          <td class="text-xs-center">{{ props.item.end_time }}</td>
          <td class="text-xs-center">
            <v-switch v-model="props.item.available" class="justify-center" @change="stateSwitch(props.item)"></v-switch>
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
    <!-- 创建 -->
    <v-dialog v-model="addDia" class="dia-modal" persistent>
      <v-card class="f-card" d-flex>
        <v-form ref="addForm">
          <v-text-field v-model="addForm.userid" label="商户ID" :rules="addFormRule.userid" @change="getQudao"></v-text-field>
          <v-text-field v-model="addForm.subsidy_amt" label="交易金额阈值" :rules="addFormRule.subsidy_amt"></v-text-field>
          <v-select v-model="addForm.subsidy_period" :items="periodList" item-text="name" item-value="id" no-data-text="暂无数据" label="返款周期" clearable :rules="addFormRule.subsidy_period"></v-select>
          <v-flex>
            <el-date-picker
              v-model="addForm.start_time"
              type="date"
              placeholder="生效日期"
              value-format="yyyy-MM-dd" :rules="addFormRule.start_time">
            </el-date-picker>
          </v-flex>
          <v-flex class="m-t-10">
            <el-date-picker
              v-model="addForm.end_time"
              type="date"
              placeholder="结束日期"
              value-format="yyyy-MM-dd">
            </el-date-picker>
          </v-flex>
          <div class="m-t-10">
            <v-btn @click="submit" color="primary">提交</v-btn>
            <v-btn @click="cancel">关闭</v-btn>
          </div>
        </v-form>
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
        { text: '渠道ID', align: 'center', sortable: false },
        { text: '渠道名称', align: 'center', sortable: false },
        { text: '商户ID', align: 'center', sortable: false },
        { text: '商户名称', align: 'center', sortable: false },
        { text: '交易金额阈值/元', align: 'center', sortable: false },
        { text: '返款周期', align: 'center', sortable: false },
        { text: '状态更新时间', align: 'center', sortable: false },
        { text: '生效时间（含）', align: 'center', sortable: false },
        { text: '结束时间（含）', align: 'center', sortable: false },
        { text: '启用状态', align: 'center', sortable: false }
      ],
      list: [],
      loading: false,
      totalItems: 0,
      page: 1,
      pageCount: 10,
      nodatatext: '正在加载',
      searchForm: {
        groupid: '',
        available: '',
        userid: '',
        subsidy_period: '',
        utime: ''
      },
      availList: [
        { id: 0, name: '禁用' },
        { id: 1, name: '启用' }
      ],
      queryLoading: false,
      addDia: false,
      addForm: {
        userid: '',
        subsidy_amt: '',
        subsidy_period: '',
        start_time: '',
        end_time: ''
      },
      addFormRule: {
        userid: [v => !!v || '请填写商户ID'],
        subsidy_amt: [v => !!v || '请填写交易金额阈值', v => v >= 1 || '金额不能小于1', v => v <= 99999 || '金额不能大于99999', v => /^\d{1,}$/.test(v) || '请输入整数'],
        subsidy_period: [v => !!v || '请选择返款周期'],
        start_time: [v => !!v || '请选择生效日期'],
        end_time: [v => !!v || '请选择结束日期']
      },
      validList: [
      ], 
      periodList: [
        { id: 1, name: '日' },
        { id: 2, name: '周' },
        { id: 3, name: '月' }
      ],
      src: '',
      reqinfo: ''
    }
  },
  filters: {
    formatPeriod (number) {
      let periodObj = {
        1: '日', 2: '周', 3: '月'
      }
      return periodObj[number]
    }
  },
  methods: {
    async getList() {
      this.searchForm.start_utime = this.searchForm.utime ? this.searchForm.utime[0] : ''
      this.searchForm.end_utime = this.searchForm.utime ? this.searchForm.utime[1] : ''
      this.loading = true
      let res = await Http.get(`/solar/v1/refund_mchnl/list?page=${this.page}&size=${this.pageCount}`, this.searchForm)
      this.loading = false
      if (res.respcd === '0000') {
        this.list = [...res.data.list]
        this.totalItems = res.data.total
        if (this.totalItems === 0) {
          this.nodatatext = '暂无数据'
        }
      }
    },
    async submit() {
      if (!this.addForm.group_rule_id) return
      let subsidy_amt = this.addForm.subsidy_amt ? this.addForm.subsidy_amt * 100 : ''
      if (!this.$refs.addForm.validate()) return
      let res = await Http.post(`/solar/v1/refund_mchnl/oper`, {
        group_rule_id: this.addForm.group_rule_id,
        userid: this.addForm.userid,
        subsidy_amt: subsidy_amt,
        subsidy_period: this.addForm.subsidy_period,
        start_time: this.addForm.start_time,
        end_time: this.addForm.end_time
      })
      if (res.respcd === '0000') {
        this.$store.dispatch('setSnackbar', {
          showSnackbar: true,
          snackbarText: '提交成功',
          snackbarColor: 'success'
        })
        this.cancel()
        this.getList()
      }
    },
    async getQudao() {
      if (!this.addForm.userid) return
      let res = await Http.get(`/solar/v1/refund_mchnl/oper`, {
        userid: this.addForm.userid
      })
      if (res.respcd === '0000') {
        this.addForm.subsidy_amt = res.data.subsidy_amt / 100
        this.addForm.group_rule_id = res.data.group_rule_id
      }
    },
    async stateSwitch (item) {
      let obj = {
        'user_rule_id': item.user_rule_id,
        'userid': item.userid,
        'available': +item.available

      }
      let res = await Http.put(`/solar/v1/refund_mchnl/oper`, obj)
      if (res.respcd === '0000') {
        this.$store.dispatch('setSnackbar', {
          showSnackbar: true,
          snackbarText: '状态更改成功',
          snackbarColor: 'success'
        })
      } else {
        item.available = Boolean(+item.available - 1)
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
      //
    },
    cancel () {
      Object.keys(this.addForm).map(item => {
        this.addForm[item] = ''
      })
      this.addDia = false
    }
  },
  created () {
    for (let i = 1; i < 13; i++) {
      this.validList.push({
        id: i, name: `${i}月`
      })
    }
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