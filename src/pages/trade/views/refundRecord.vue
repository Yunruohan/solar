<template>
  <div>
    <v-card flat class="mt-2">
      <v-layout justify-space-between class="p-b-8">
        <v-form ref="searchForm" class="f-wrap">
          <v-text-field v-model="searchForm.groupid" label="渠道ID" class="t-f"></v-text-field>
          <v-text-field v-model="searchForm.userid" label="商户ID" class="t-f"></v-text-field>
          <v-select v-model="searchForm.status" :items="statusList" item-text="name" item-value="id" no-data-text="暂无数据" placeholder="请选择出款状态" label="出款状态" clearable class="t-f"></v-select>
          <v-select v-model="searchForm.subsidy_period" :items="periodList" item-text="name" item-value="id" no-data-text="暂无数据" placeholder="请选择出款周期" label="出款周期" clearable class="t-f"></v-select>
          <el-date-picker
            v-model="searchForm.utime"
            type="daterange"
            start-placeholder="生成开始"
            end-placeholder="生成结束"
            value-format="yyyy-MM-dd HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']">
          </el-date-picker>
          <v-btn @click="query" color="primary" :loading="queryLoading">查找</v-btn>
          <!-- <v-btn @click="exportExcel" color="primary">导出</v-btn> -->
        </v-form>
      </v-layout>
      <v-data-table :headers="headers" :items="list" hide-actions class="elevation-1" :loading="loading" :no-data-text="nodatatext">
        <template slot="items" slot-scope="props">
          <td class="text-xs-center">{{ props.item.userid }}</td>
          <td class="text-xs-center">{{ props.item.create_time }}</td>
          <td class="text-xs-center">{{ props.item.amt / 100 }}</td>
          <td class="text-xs-center">{{ props.item.fee / 100 }}</td>
          <td class="text-xs-center">{{ props.item.status | formatStatus}}</td>
          <td class="text-xs-center">{{ props.item.subsidy_period | formatPeriod}}</td>
          <td class="text-xs-center">{{ props.item.groupid }}</td>
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
        { text: '生成时间', align: 'center', sortable: false },
        { text: '补贴金额/元', align: 'center', sortable: false },
        { text: '补贴手续费/元', align: 'center', sortable: false },
        { text: '补贴状态', align: 'center', sortable: false },
        { text: '出款周期', align: 'center', sortable: false },
        { text: '渠道ID', align: 'center', sortable: false }
      ],
      list: [],
      loading: false,
      totalItems: 0,
      page: 1,
      pageCount: 10,
      nodatatext: '正在加载',
      searchForm: {
        groupid: '',
        status: '',
        userid: '',
        subsidy_period: '',
        utime: ''
      },
      statusList: [
        {id: 0, name: '未生成'},
        {id: 1, name: '已生成'}
      ],
      queryLoading: false,
      validList: [
      ], 
      periodList: [
        {id: 1, name: '日'},
        {id: 2, name: '周'},
        {id: 3, name: '月'}
      ],
      src: '',
      reqinfo: ''
    }
  },
  filters: {
    formatStatus (id) {
      let obj = {
        0: '未生成',
        1: '已生成'
      }
      return obj[id]
    },
    formatPeriod (id) {
      let obj = {
        1: '日',
        2: '周',
        3: '月'
      }
      return obj[id]
    }
  },
  methods: {
    async getList() {
      this.searchForm.start_ctime = this.searchForm.utime ?this.searchForm.utime[0] : ''
      this.searchForm.end_ctime = this.searchForm.utime ? this.searchForm.utime[1] : ''
      let res = await Http.get(`/solar/v1/refund_bill/list?page=${this.page}&size=${this.pageCount}&record_type=2`, this.searchForm)
      if (res.respcd === '0000') {
        this.list = [...res.data.list]
        this.totalItems = res.data.total
        if (this.totalItems == 0) {
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
    }
  },
  created () {
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


