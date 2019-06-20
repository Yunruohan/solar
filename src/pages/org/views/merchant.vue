<template>
  <div class="merchant">
    <v-layout align-center justify-space-between>
      <v-form ref="searchForm" class="search-form">
        <v-text-field label="用户ID" outline hide-details v-model="searchParams.name"/>
        <v-text-field label="手机号" outline hide-details v-model="searchParams.username"/>
        <v-text-field label="渠道ID" outline hide-details v-model="searchParams.username"/>
        <v-text-field label="签约实体" outline hide-details v-model="searchParams.username"/>
        <v-text-field label="收据名称" outline hide-details v-model="searchParams.username"/>
        <v-select
          label="用户状态" outline hide-details
          :items="userStatus"
          v-model="searchParams.status"
        >
        </v-select>
        <v-btn @click="search()" color="primary">查找</v-btn>
      </v-form>
      <div style="text-align:right">
        <v-btn @click="addButton()" color="primary" dark>导出查询的商户</v-btn>
        <v-btn @click="addButton()" color="primary" dark>导出即将失效商户</v-btn>
      </div>
    </v-layout>
    <v-data-table
      :headers="headers"
      :items="desserts"
      :loading="isPending"
      hide-actions
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.userid }}</td>
        <td>{{ props.item.name }}</td>
        <td>{{ props.item.mobile}}</td>
        <td>{{ props.item.nickname}}</td>
        <td>{{ props.item.groupid }}</td>
        <td>{{ props.item.groupname }}</td>
        <td>{{ props.item.lastaudittime }}</td>
        <td>{{ props.item.auditstate }}</td>
        <td>{{ props.item.state }}</td>
        <td>
          <v-btn flat icon color="primary" class="mx-0" @click="viewGoods(props.item)">详情</v-btn>
        </td>
      </template>
      <template slot="no-data">
        <p style="text-align:center;padding-top:16px;">暂无数据</p>
      </template>
    </v-data-table>
    <div class="pagination-container">
      <span class="pagination-total">共 {{total}} 条</span>
      <v-select
        v-model="length"
        :items="selectItems"
        @change="fetchData()"
        height="20"
        label="10页/条"
        solo
      ></v-select>
      <v-pagination
        v-model="start"
        @input="fetchData()"
        :length="parseInt(total / length) + 1"
        :total-visible="7"
      ></v-pagination>
    </div>
    <comfirm @okHandler="updateStatus()" @cancelHandler="cancelUpdateStatus()" :isVisiable="showComfirm" :msg="currentItem.status === 1 ? '确定下架该机构吗？' : '确定上架该机构吗？'" />
  </div>
</template>

<script>
// @ is an alias to /src
import Comfirm from '@/components/Comfirm'
// import qs from 'qs'
export default {
  components: {
    Comfirm
  },
  data () {
    return {
      userStatus: [{
        value: '',
        text: '全部'
      }, {
        value: 1,
        text: '未知'
      }, {
        value: 2,
        text: '绑定'
      }, {
        value: 3,
        text: '激活'
      }, {
        value: 4,
        text: '消费'
      }, {
        value: 5,
        text: '沉默'
      }, {
        value: 6,
        text: '黑名单'
      }, {
        value: 7,
        text: '封禁'
      }, {
        value: 8,
        text: '注销'
      }, {
        value: 9,
        text: '关闭'
      }],
      searchParams: {
        name: '',
        status: '',
        qd_uid: ''
      },
      headers: [
        { text: '用户ID', value: 'name', sortable: false },
        { text: '签约实体', value: 'qd_uid', sortable: false },
        { text: '手机号', value: 'username', sortable: false },
        { text: '收据名称', value: 'type', sortable: false },
        { text: '渠道ID', value: 'ctime', sortable: false },
        { text: '渠道名称', value: 'utime', sortable: false },
        { text: '审核时间', value: 'status', sortable: false },
        { text: '审核状态', value: 'id', sortable: false },
        { text: '用户状态', value: 'id', sortable: false },
        { text: '操作', value: 'id', sortable: false }
      ],
      isPending: false,
      desserts: [],
      total: 0,
      start: 0,
      length: 10,
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
      }]
    }
  },
  created () {
    this.fetchData()
  },
  methods: {
    search () {
      this.start = 0
      this.length = 10
      this.fetchData()
    },
    fetchData () {
      this.isPending = true
      let params = {
        start: this.start,
        length: this.length
      }
      Object.assign(params, this.searchParams)
      this.$http({
        url: '/api/v1/merchants',
        method: 'GET',
        params
      }).then(res => {
        this.isPending = false
        if (res.total > 0) {
          this.desserts = res.data
          this.total = res.total
        }
      })
    },
    reset () {
      this.$refs.baseForm.reset()
    }
  }
}
</script>

<style lang="scss">

</style>
