<template>
  <div class="codes">
    <v-form ref="searchForm" class="search-form">
      <v-select
        class="group-select"
        label="组" hide-details
        :items="searchFormGroups"
        multiple clearable
        v-model="searchParams.group"
        no-data-text="暂无数据"
      />
      <v-select
        label="状态" hide-details
        :items="searchFormStatus"
        v-model="searchParams.status"
        no-data-text="暂无数据"
      />
      <v-btn :loading="isPending" @click="search()" color="accent">查找</v-btn>
    </v-form>

    <div v-for="(group, groupKey, index) in groups" :key="groupKey" class="chip-box elevation-1">
      <h3>{{groupsNameObject[groupKey]}}</h3>
      <v-chip v-for="code in group" :key="code.code" :alt="code.code" :color="clipColor(code.status, index, code.ishere)"
      :text-color="code.status === 1 ? 'white' : '#888'" @click="edit(code, groupKey)">
        {{code.name}}
        <v-icon v-show="code.status === 1" right @click.stop="beforeUpdateStatus(code, groupKey)" color="white">block</v-icon>
      </v-chip>
    </div>
    <v-dialog
      v-model="showDialog"
      max-width="320"
    >
      <v-form ref="editForm" class="edit-form elevation-1">
        <v-text-field :label="currentItem.code" hide-details v-model="currentItem.name"/>
        <div class="text-xs-right">
          <v-btn class="close-btn" flat icon @click="showDialog = false">
            <v-icon>close</v-icon>
          </v-btn>
          <v-btn color="primary" small style="min-width:66px" @click="beforeUpdateCurrentName()">修改</v-btn>
        </div>
      </v-form>
    </v-dialog>
    <comfirm @okHandler="updateCurrentName()" @cancelHandler="cancelNameComfirm()" :isVisiable="showNameComfirm"
    :msg="`确定把 ${currentItemOldName} 改成 ${currentItem.name} 吗？`" />
    <comfirm @okHandler="updateStatus()" @cancelHandler="showStatusComfirm = false" :isVisiable="showStatusComfirm"
    :msg="currentItem.status === 0 ? `确定启用 ${currentItem.name} 吗？` : `确定禁用 ${currentItem.name} 吗？`" />
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
      searchParams: {
        group: '',
        status: ''
      },
      searchFormGroups: [],
      searchFormStatus: [{
        value: '',
        text: '全部'
      }, {
        value: 1,
        text: '启用'
      }, {
        value: 0,
        text: '禁用'
      }],
      isPending: false,
      groupsNameObject: {},
      groups: {},
      showDialog: false,
      currentItemOldName: '', // 修改之前的 name
      currentItem: {}, // 当前操作 chip item
      showNameComfirm: false,
      showStatusComfirm: false
    }
  },
  created () {
    this.fetchGroupsName()
  },
  methods: {
    search () {
      this.fetchData()
    },
    fetchGroupsName() {
      this.isPending = true
      this.$http({
        url: '/solar/v1/perm/configs',
        method: 'GET'
      }).then(res => {
        let groups = res.perm_groups
        this.groupsNameObject = groups
        for (let key in res.perm_groups) {
          this.searchFormGroups.push({
            value: key,
            text: groups[key]
          })
        }
        this.fetchData()
      })
    },
    fetchData(updateSuccess) {
      this.isPending = true
      this.$http({
        url: '/solar/v1/perm/perms',
        method: 'GET',
        params: {
          group: this.searchParams.group.toString(),
          status: this.searchParams.status
        }
      }).then(res => {
        this.isPending = false
        this.groups = res
        if (updateSuccess) {
          this.afterUpdateCurrentName()
        }
      })
    },
    clipColor(status, index, ishere) {
      if (ishere) {
        return 'secondary'
      } else if (status === 0) {
        return 'gray'
      } else {
        return index % 2 === 0 ? 'green' : 'primary'
      }
    },
    edit(item, group) {
      if (item.status === 0) {
        this.beforeUpdateStatus(item, group)
      } else {
        this.showDialog = true
        this.currentItemOldName = item.name
        this.currentItem = { ...item }
      }
    },
    beforeUpdateCurrentName() {
      if (this.currentItem.name === this.currentItemOldName) {
        this.showDialog = false
      } else {
        this.showDialog = false
        this.showNameComfirm = true
      }
    },
    cancelNameComfirm () {
      this.currentItem.name = this.currentItemOldName
      this.showNameComfirm = false
    },
    updateCurrentName() {
      this.$http({
        url: '/solar/v1/perm/perm/info',
        method: 'PUT',
        params: {
          name: this.currentItem.name,
          perm_id: this.currentItem.perm_id
        }
      }).then(res => {
        this.$emit('toast', '修改成功', 'success', 1000)
        this.showNameComfirm = false
        this.showDialog = false
        this.fetchData(true)
      })
    },
    afterUpdateCurrentName() {
      let flag = false
      for (let group in this.groups) {
        for (let i = 0; i < this.groups[group].length; i++) {
          if (this.groups[group][i].name === this.currentItem.name) {
            flag = true
            this.$set(this.groups[group][i], 'ishere', true)
            break
          }
        }
        if (flag) {
          break
        }
      }
    },
    beforeUpdateStatus (item, group) {
      this.showStatusComfirm = true
      this.currentItem = { ...item }
    },
    updateStatus() {
      this.$http({
        url: '/solar/v1/perm/perm/info',
        method: 'PUT',
        params: {
          perm_id: this.currentItem.perm_id,
          status: this.currentItem.status === 1 ? 0 : 1
        }
      }).then(res => {
        if (res !== 'error') {
          this.showStatusComfirm = false
          this.$emit('toast', this.currentItem.status === 1 ? '禁用成功' : '启用成功', 'success', 1000)
          this.fetchData()
        }
      })
    }
  }
}
</script>

<style lang="scss">
  .chip-box {
    padding: 0 20px 15px;
    margin-bottom: 20px;
    background-color: #fff;
    h3 {
      padding: 15px 0;
    }
  }
  .v-chip.primary {
    font-weight: bold;
  }
</style>
