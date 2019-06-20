<template>
  <div>
    <v-card flat class="mt-2">
      <v-layout justify-space-between class="p-b-8">
        <v-form ref="searchForm" class="f-wrap">
          <v-text-field v-model="searchForm.groupid" label="渠道ID" class="t-f"></v-text-field>
          <v-select v-model="searchForm.available" :items="availList" item-text="name" item-value="id" no-data-text="暂无数据" placeholder="请选择启用状态" label="启用状态" clearable class="t-f"></v-select>
          <el-date-picker
            v-model="searchForm.utime"
            type="daterange"
            start-placeholder="开始"
            end-placeholder="结束"
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
          <!-- 不能小于100 不能大于9999900 -->
          <td class="text-xs-center">{{ props.item.subsidy_amt/100 }}</td>
          <td class="text-xs-center">{{ props.item.utime }}</td>
          <td class="text-xs-center">{{ props.item.start_time }}</td>
          <td class="text-xs-center">{{ props.item.end_time }}</td>
          <td class="text-xs-center">{{ props.item.valid_date }}月</td>
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
          <v-text-field v-model="addForm.groupid" label="渠道编号" :rules="addFormRule.groupid"></v-text-field>
          <v-text-field v-model="addForm.subsidy_amt" label="交易金额阈值" :rules="addFormRule.subsidy_amt"></v-text-field>
          <el-date-picker
            v-model="addForm.start_time"
            type="date"
            placeholder="生效日期"
            value-format="yyyy-MM-dd" @change="setEnd" :rules="addFormRule.start_time">
          </el-date-picker>
          <v-select v-model="addForm.valid_date" :items="validList" item-text="name" item-value="id" no-data-text="暂无数据" label="生效时长" clearable :rules="addFormRule.valid_date" @change="setEnd"></v-select>
          <el-date-picker
            v-model="addForm.end_time"
            type="date"
            placeholder="结束日期"
            value-format="yyyy-MM-dd" disabled>
          </el-date-picker>
          <div>
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
        { text: '交易金额阈值/元', align: 'center', sortable: false },
        { text: '更新时间', align: 'center', sortable: false },
        { text: '生效时间（含）', align: 'center', sortable: false },
        { text: '结束时间（含）', align: 'center', sortable: false },
        { text: '生效时长', align: 'center', sortable: false },
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
        utime: ''
      },
      availList: [
        {id: 0, name: '禁用'},
        {id: 1, name: '启用'}
      ],
      queryLoading: false,
      addDia: false,
      dia: false,
      addForm: {
        groupid: '',
        subsidy_amt: '',
        valid_date: '',
        start_time: '',
        end_time: ''
      },
      addFormRule: {
        groupid: [v => !!v || '请填写渠道编号'],
        subsidy_amt: [v => !!v || '请填写交易金额阈值', v => v >= 1 || '金额不能小于1', v => v <= 99999 || '金额不能大于99999', v => /^\d{1,}$/.test(v) || '请输入整数'],
        valid_date: [v => !!v || '请选择生效时长'],
        start_time: [v => !!v || '请选择生效日期']
      },
      validList: [
      ],
      src: '',
      reqinfo: ''
    }
  },
  methods: {
    addDateZero (n) {
      n = n + ''
      n = n.length == 1 ? `0${n}` : n
      return n
    },
    setEnd () {
      if (!this.addForm.start_time || !this.addForm.valid_date) return
      let time_s = new Date(this.addForm.start_time)
      time_s = new Date(time_s.setMonth(time_s.getMonth() + this.addForm.valid_date))
      // 日期结束时间还要减一天
      time_s.setDate(time_s.getDate() - 1)
      this.addForm.end_time = `${time_s.getFullYear()}-${this.addDateZero(time_s.getMonth()+1)}-${this.addDateZero(time_s.getDate())}`
    },
    async getList() {
      console.log('---', this.searchForm)
      this.searchForm.start_time = this.searchForm.utime ?this.searchForm.utime[0] : ''
      this.searchForm.end_time = this.searchForm.utime ? this.searchForm.utime[1] : ''
      let res = await Http.get(`/solar/v1/refund_chnl/list?page=${this.page}&size=${this.pageCount}`, {
        groupid: this.searchForm.groupid,
        available: this.searchForm.available,
        start_utime: this.searchForm.start_time,
        end_utime: this.searchForm.end_time
      })
      if (res.respcd === '0000') {
        this.list = [...res.data.list]
        this.totalItems = res.data.total
        if (this.totalItems == 0) {
          this.nodatatext = '暂无数据'
        }
      }
    },
    async submit() {
      let subsidy_amt = this.addForm.subsidy_amt ? this.addForm.subsidy_amt*100 : ''
      if (!this.$refs.addForm.validate()) return
      let res = await Http.post(`/solar/v1/refund_chnl/oper`, {
        groupid: this.addForm.groupid,
        subsidy_amt: subsidy_amt,
        valid_date: this.addForm.valid_date,
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
    async stateSwitch (item) {
      let obj = {
        'group_rule_id': item.group_rule_id,
        'groupid': item.groupid,
        'available': +item.available
      }
      let res = await Http.put(`/solar/v1/refund_chnl/oper`, obj)
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
      this.searchForm.start_time = this.searchForm.utime ?this.searchForm.utime[0] : ''
      this.searchForm.end_time = this.searchForm.utime ? this.searchForm.utime[1] : ''
      const href = location.hostname === 'localhost' ? 'http://172.100.108.222:2990' : location.origin
      this.$nextTick(() => {
        this.src = `${href}/solar/v1/refund_chnl/list?mode=expo_excel&groupid=${this.searchForm.groupid}&available=${this.searchForm.groupid}&start_time=${this.searchForm.start_time}&end_time=${this.searchForm.end_time}`
      })
    },
    showDia (info) {
      this.dia = true
      this.reqinfo = info
    },
    record () {
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
    for (let i=1;i<13;i++) {
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
</style>


