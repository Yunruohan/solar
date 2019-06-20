<template>
  <div class="roles mt-4">
    <v-progress-linear :indeterminate="isPending" color="#C7E1FB" background-color="#00b3e3" height="2"></v-progress-linear>
    <v-layout class="elevation-1" row wrap>
      <v-flex xs3>
        <h3 class="group-title">角色分组</h3>
        <ul class="group-list">
          <li v-for="(group, groupKey, index) in roleGroups" :key="groupKey" :class="{active: groupKey === currentGroup}" @click="selectGroup(groupKey, index)">{{group}}</li>
          <li @click="showNewGroupDialog = true"><v-icon>add</v-icon>添加分组</li>
        </ul>
      </v-flex>
      <v-flex xs9>
        <template v-if="currentGroup">
          <v-form ref="searchForm" class="search-form pt-0">
            <v-text-field v-model="searchRoleName" hide-details label="角色"></v-text-field>
            <v-btn @click="fetchData()">重置</v-btn>
            <v-btn @click="search()" color="accent">查找</v-btn>
          </v-form>
          <v-chip v-for="role in roles" :key="role.id" :color="clipColor(role.status, role.ishere)"
          :text-color="role.status === 1 ? 'white' : '#888'" @click="editRole(role.code, role.name)">
            {{role.name}}
            <v-icon v-show="role.status === 1" right @click.stop="updateStatus(role.code, role.status)" color="white">block</v-icon>
          </v-chip>
          <v-btn @click="addPerm()" round color="primary"><v-icon>add</v-icon>添加角色</v-btn>
        </template>
        <div v-else>
          <p>请先左侧选择分组，再显示该分组下的角色</p>
          <p>权限弹框右上角 <v-icon color="primary">settings</v-icon> 可以设置常用的权限分组</p>
        </div>
      </v-flex>
    </v-layout>
    <v-dialog
      v-model="isShowDialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-toolbar card dark color="primary">
        <v-toolbar-title v-if="isSetting">显示/隐藏 分组</v-toolbar-title>
        <v-toolbar-title v-else>{{isUpdate ? '角色重新分配权限' : '添加新角色'}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn title="显示/隐藏 分组" icon @click="permSetting()">
          <v-icon>settings</v-icon>
        </v-btn>
        <v-btn icon @click.native="isShowDialog = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-form v-show="!isSetting" ref="roleForm" class="role-form">
        <v-text-field v-model="currentRoleName" hide-details label="角色名称"></v-text-field>
        <v-select
          class="group-select"
          label="所属组" hide-details
          :items="selectRoleGroups"
          v-show="isUpdate"
          v-model="currentGroup"
          @change="beforeChangeGroup()"
          no-data-text="暂无数据"
        />
      </v-form>
      <div v-for="(perm, groupKey) in perms" :key="groupKey" class="group-perms" v-show="isSetting || permGroupsShow[groupKey]">
        <header :class="{'ishide' : !permGroupsShow[groupKey]}">
          <v-btn icon v-show="isSetting" class="mx-0 my-0" @click="hideCurrentGroupPerms(groupKey)" :title="permGroupsShow[groupKey] ? '点击隐藏分组' : '点击显示分组'">
            <v-icon>{{permGroupsShow[groupKey] ? 'visibility' : 'visibility_off'}}</v-icon>
          </v-btn>
          <h3>{{permGroups[groupKey]}}</h3>
        </header>
        <v-checkbox
          v-for="item in perm"
          :key="item.code"
          v-model="selectedCodes"
          :readonly="isSetting"
          :disabled="isSetting && !permGroupsShow[groupKey]"
          :value="item.code"
          :label="item.name"
          type="checkbox"
        ></v-checkbox>
      </div>
      <footer class="px-3 pb-3 text-xs-right">
        <v-btn v-if="isSetting" @click="showAllGroup()">显示所有分组</v-btn>
        <template v-else>
          <v-btn @click="isShowDialog = false">关闭</v-btn>
          <v-btn @click="savePerm()" color="primary">保存</v-btn>
        </template>
      </footer>
    </v-dialog>
    <v-dialog
      v-model="showNewGroupDialog"
      max-width="320"
    >
      <v-form ref="editForm" class="edit-form elevation-1">
        <v-text-field label="分组名称" hide-details v-model="newGroupName"/>
        <div class="text-xs-right">
          <v-btn class="close-btn" flat icon @click="showNewGroupDialog = false">
            <v-icon>close</v-icon>
          </v-btn>
          <v-btn color="primary" small style="min-width:66px" @click="appendGroup()">添加分组</v-btn>
        </div>
      </v-form>
    </v-dialog>

    <comfirm @okHandler="changeRoleGroup()" @cancelHandler="cancelChangeGroup()" :isVisiable="showComfirm"
    :msg="`确定把 ${this.currentRoleName} 从 ${currentOldGroup} 移到 ${currentGroup} 吗？(权限不会修改)`" />
  </div>
</template>

<script>
import Comfirm from '@/components/Comfirm'
export default {
  components: {
    Comfirm
  },
  data () {
    return {
      currentGroup: '',
      roleGroups: [],
      searchRoleName: '',
      roles: [],
      isPending: false,
      isShowDialog: false,
      selectRoleGroups: [], // 角色分配其他组，下拉选择框使用
      permGroups: {},
      permGroupsShow: {},
      perms: [],
      currentRoleName: '',
      currentRoleCode: '',
      selectedCodes: [], // 选中的权限
      isSetting: false, // 设置常用的权限
      isUpdate: false,
      showNewGroupDialog: false,
      newGroupName: '',
      currentOldGroup: '',
      showComfirm: false
    }
  },
  created () {
    this.fetchGroups()
  },
  methods: {
    search () {
      let flag = false
      this.roles.map((role) => {
        if (role.name.indexOf(this.searchRoleName) >= 0) {
          flag = true
          this.$set(role, 'ishere', true)
        } else {
          this.$set(role, 'ishere', false)
        }
      })
      if (!flag) {
        this.$emit('toast', '查无此角色')
      }
    },
    fetchGroups() {
      this.isPending = true
      this.$http({
        url: '/solar/v1/perm/configs',
        method: 'GET'
      }).then(res => {
        let groups = res.role_groups
        this.roleGroups = groups
        for (let key in groups) {
          this.selectRoleGroups.push({
            value: key,
            text: groups[key]
          })
        }
        this.permGroups = res.perm_groups
        // 设置常用分组 显示和隐藏常用的分组
        if (localStorage.getItem('permGroupsShow')) {
          this.permGroupsShow = JSON.parse(localStorage.getItem('permGroupsShow'))
        } else {
          // 显示所有分组
          this.permGroupsShow = { ...this.permGroups }
        }
        this.fetchPerms()
      })
    },
    fetchPerms() {
      this.$http({
        url: '/solar/v1/perm/perms',
        method: 'GET',
        params: {
          status: 1
        }
      }).then(res => {
        this.isPending = false
        this.perms = res
      })
    },
    selectGroup(groupKey, index) {
      this.currentGroup = groupKey
      this.fetchData()
    },
    appendGroup() {
      this.$http({
        url: '/solar/v1/perm/role/info',
        method: 'POST',
        data: {
          group: this.newGroupName,
          name: '默认角色（无权限）',
          perm_codes: []
        }
      }).then(res => {
        this.$emit('toast', `已添加新分组 ${this.newGroupName}`, 'success', 2000)
        this.fetchGroups()
      })
    },
    fetchData() {
      this.isPending = true
      this.$http({
        url: '/solar/v1/perm/role/list',
        method: 'GET',
        params: {
          group: this.currentGroup
        }
      }).then(res => {
        this.isPending = false
        this.roles = res.list
      })
    },
    updateStatus(roleCode, status) {
      this.$http({
        url: '/solar/v1/perm/role/info',
        method: 'PUT',
        data: {
          role_code: roleCode,
          status: status === 1 ? 0 : 1
        }
      }).then(res => {
        this.fetchData()
      })
    },
    clipColor(status, ishere) {
      if (ishere) {
        return 'secondary'
      } else if (status === 0) {
        return 'gray'
      } else {
        return 'green'
      }
    },
    editRole(roleCode, roleName) {
      this.isShowDialog = true
      this.isUpdate = true
      this.isSetting = false
      this.currentOldGroup = this.currentGroup
      this.$http({
        url: '/solar/v1/perm/role/relation',
        method: 'GET',
        params: {
          role_code: roleCode
        }
      }).then(res => {
        this.currentRoleName = roleName
        this.currentRoleCode = roleCode
        this.selectedCodes = res.perms
      })
    },
    beforeChangeGroup() {
      if (this.currentGroup === this.currentOldGroup) {
        this.showDialog = false
      } else {
        this.showComfirm = true
      }
    },
    cancelChangeGroup() {
      this.currentGroup = this.currentOldGroup
      this.showComfirm = false
    },
    changeRoleGroup() {
      this.$http({
        url: '/solar/v1/perm/role/info',
        method: 'PUT',
        data: {
          role_code: this.currentRoleCode,
          group: this.currentGroup,
          name: this.currentName
        }
      }).then(res => {
        this.isShowDialog = false
        this.showComfirm = false
        this.$emit('toast', '修改分组成功', 'success', 2000)
        this.fetchData()
      })
    },
    permSetting() {
      this.isSetting = !this.isSetting
    },
    hideCurrentGroupPerms(groupKey) {
      if (this.permGroupsShow[groupKey]) {
        this.permGroupsShow[groupKey] = false
      } else {
        this.permGroupsShow[groupKey] = true
      }
      localStorage.setItem('permGroupsShow', JSON.stringify(this.permGroupsShow))
    },
    showAllGroup() {
      this.permGroupsShow = { ...this.permGroups }
      localStorage.removeItem('permGroupsShow')
    },
    addPerm() {
      this.isShowDialog = true
      this.isUpdate = false
      this.isSetting = false
      this.selectedCodes = []
      this.currentRoleName = ''
      this.currentRoleCode = ''
    },
    savePerm() {
      this.$http({
        url: '/solar/v1/perm/role/info',
        method: this.isUpdate ? 'PUT' : 'POST',
        data: {
          name: this.currentRoleName,
          group: this.currentGroup,
          role_code: this.currentRoleCode,
          perm_codes: this.selectedCodes
        }
      }).then(res => {
        this.$emit('toast', this.isUpdate ? '更新成功' : '添加成功', 'success', 2000)
        this.isShowDialog = false
        this.fetchData()
      })
    }
  }
}
</script>

<style lang="scss">
.layout {
  background-color: #fff;
  margin-bottom: 20px;
}
.xs3 {
  border-right: 1px solid #e7eaec;
  padding: 0 30px;
}
.group-title {
  text-align: center;
  padding-top: 20px;
  margin-bottom: 10px;
}
.group-list {
  list-style: none;
  padding-left: 0;
  li {
    text-align: center;
    line-height: 40px;
    border-bottom: 1px dashed #c2c2c2;
    cursor: pointer;
    &.active {
      background-color: #f1f4f7;
    }
  }
}
.xs9 {
  padding-top: 20px;
  padding-left: 20px;
}
.group-perms {
  padding: 20px 20px 6px 35px;
  h3 {
    display: inline-block;
    vertical-align: middle;
  }
  header {
    margin-left: -10px;
  }
  header.ishide {
    opacity: 0.5;
  }
}
.role-form {
  padding-left: 20px;
  padding-top: 20px;
}
.v-input--checkbox {
  display: inline-block;
  margin-right: 30px;
}
</style>
