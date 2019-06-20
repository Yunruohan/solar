<template>
  <div class="users">
    <v-form ref="searchForm" class="search-form elevation-1">
      <v-text-field label="手机号" hide-details v-model="searchParams.mobile"/>
      <v-text-field label="真实姓名" hide-details v-model="searchParams.name"/>
      <v-text-field label="角色" hide-details v-model="searchParams.role_name"/>
      <v-autocomplete
        label="身份" hide-details
        v-model="searchParams.cate_code"
        :hint="`${select.code}, ${select.name}`"
        :items="cateList"
        item-text="code"
        item-value="name"
      >
      </v-autocomplete>
      <div style="text-align:right">
        <v-btn @click="search()" color="primary">查找</v-btn>
        <v-btn @click="reSearch()">重置</v-btn>
      </div>
    </v-form>
    <v-data-table
      :headers="headers"
      :items="desserts"
      :loading="isPending"
      hide-actions
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.userid }}</td>
        <td>{{ props.item.mobile }}</td>
        <td>{{ props.item.name }}</td>
        <td>{{ props.item.cate_names.toString() }}</td>
        <td>
          <v-btn flat icon color="primary" class="mx-0" @click="changeCate(props.item)">
            <v-icon small>details</v-icon>
          </v-btn>
        </td>
        <td><p style="word-break: break-all;margin-top:15px;">{{ props.item.role_names.toString() }}</p></td>
        <td>
          <v-btn flat icon color="primary" class="mx-0" @click="changeDetails(props.item.userid, props.item.name)">
            <v-icon small>details</v-icon>
          </v-btn>
        </td>
        <td>{{ props.item.jointime }}</td>
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
      transition="dialog-bottom-transition">
      <v-toolbar card dark color="primary">
        <v-toolbar-title>分配角色</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon dark @click.native="isShowDialog = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-form ref="roleForm" class="role-form">
        <el-transfer
          filterable
          :filter-method="filterMethod"
          filter-placeholder="请输入角色名称"
          v-model="value"
          :data="data"
          :titles="['备选角色', `${username}的角色`]">
       </el-transfer>
      </v-form>
      <footer class="px-3 pb-3 text-xs-center">
        <v-btn @click="changeDetails()">重置</v-btn>
        <v-btn @click="saveRoles()" color="primary">保存</v-btn>
      </footer>
    </v-dialog>
    <v-dialog
      v-model="isShowDialog1"
      max-width="50%"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-card-title class="headline primary" style="color: #fff">分配身份</v-card-title>
        <v-card-actions>
          <v-checkbox
            v-for="item in cateList"
            :key="item.code"
            v-model="selectedCate"
            :value="item.name"
            :label="item.code"
            type="checkbox"
        ></v-checkbox>
        </v-card-actions>
        <footer class="px-3 pb-3 text-xs-center">
          <v-btn @click="isShowDialog1 = false">关闭</v-btn>
          <v-btn @click="saveCate()" color="primary">保存</v-btn>
        </footer>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
// @ is an alias to /src
export default {
  data () {
    return {
      select: { name: '', code: '' },
      value: [],
      filterMethod(query, item) {
        return item.label.indexOf(query) > -1
      },
      searchParams: {
        mobile: '',
        name: '',
        role_name: '',
        cate_code: ''
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
        { text: 'ID', sortable: false },
        { text: '手机号', sortable: false },
        { text: '真实姓名', sortable: false },
        { text: '身份', sortable: false },
        { text: '分配身份', sortable: false },
        { text: '角色', sortable: false },
        { text: '分配角色', sortable: false },
        { text: '最后登录时间', sortable: false }
      ],
      isPending: false,
      // 列表数据数组
      desserts: [],
      total: 10,
      page: 1,
      pageSize: 10,
      baseFormData: {},
      isShowDialog: false,
      isShowDialog1: false,
      selectedCate: [],
      data: [],
      userid: '',
      username: '',
      useridCate: '',
      cateList: []
    }
  },
  created () {
    this.fetchData()
    this.getAllRoles()
    this.getCates()
  },
  methods: {
    // 获得所有的角色
    getAllRoles() {
      this.$http({
        url: '/solar/v1/perm/roles',
        method: 'GET'
      }).then(res => {
        res.forEach(element => {
          this.data.push({
            label: element.name,
            key: element.code
          })
        })
      })
    },
    // 获得所有的身份
    getCates() {
      this.$http({
        url: '/solar/v1/perm/configs',
        method: 'GET'
      }).then(res => {
        this.cateList = res.cates
      })
    },
    // 查询按钮方法
    search () {
      this.pageSize = 10
      this.page = 1
      this.fetchData()
    },
    // 列表数据请求的方法
    fetchData () {
      this.isPending = true
      let params = {
        size: this.pageSize,
        page: this.page - 1 // 第一页 page = 0
      }
      Object.assign(params, this.searchParams)
      this.$http({
        url: '/solar/v1/perm/user/list',
        method: 'GET',
        params
      }).then(res => {
        this.isPending = false
        this.desserts = res.list
        this.total = res.total
      })
    },
    reset() {
      this.$refs.baseForm.reset()
    },
    reSearch() {
      this.$refs.searchForm.reset()
      this.fetchData()
    },
    // 获得用户权限角色信息
    changeDetails(userid = this.userid, username = this.username) {
      this.userid = userid
      this.username = username
      this.$http({
        url: '/solar/v1/perm/user/roles',
        method: 'GET',
        params: {
          userid: this.userid
        }
      }).then(res => {
        let selectedRoles = []
        res.forEach(element => {
          selectedRoles.push(element.code)
        })
        this.value = selectedRoles
        this.isShowDialog = true
      })
    },
    // 重置用户的管理员标识
    saveRoles() {
      this.$http({
        url: '/solar/v1/perm/user/roles',
        method: 'PUT',
        data: {
          userid: this.userid,
          role_codes: this.value
        }
      }).then(res => {
        if (res === 'error') {
          this.$emit('toast', '修改失败', 'error', 1000)
          return false
        }
        this.isShowDialog = false
        this.$emit('toast', '修改成功', 'success', 1000)
        this.fetchData()
      })
    },
    changeCate(item) {
      this.isShowDialog1 = true
      this.useridCate = item.userid
      this.selectedCate = item.cate_codes
    },
    saveCate() {
      this.$http({
        url: '/solar/v1/perm/user/cates',
        method: 'PUT',
        data: {
          userid: this.useridCate,
          cate_codes: this.selectedCate
        }
      }).then(res => {
        if (res === 'error') {
          this.$emit('toast', '修改失败', 'error', 1000)
          return false
        }
        this.isShowDialog1 = false
        this.$emit('toast', '修改成功', 'success', 1000)
        this.fetchData()
      })
    }
  }
}
</script>

<style lang="scss" scope>
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
  .role-form {
    margin: 30px;
  }
</style>
