<template>
  <div class="full-s-v">
    <v-card flat class="mt-2">
    <v-layout justify-space-between>
      <v-form ref="searchForm" class="f-wrap">
        <v-select v-model="searchParams.chnlid" :items="chnlid_arr" item-text="val" item-value="key" no-data-text="暂无数据" placeholder="请选择通道" label="通道名称" class="f-i" clearable></v-select>
        <v-select v-model="searchParams.trade_type" :items="tradeTypes" item-text="val" item-value="key" no-data-text="暂无数据" placeholder="请选择交易类型" label="交易类型" class="f-i" clearable></v-select>
        <v-select v-model="searchParams.available" :items="availableItems" item-text="name" item-value="id" no-data-text="暂无数据" placeholder="请选择状态" label="状态" clearable></v-select>
      </v-form>
      <v-layout justify-end>
        <v-btn @click="getList" color="primary">查找</v-btn>
        <v-btn @click="add" color="primary" dark>创建</v-btn>
      </v-layout>
    </v-layout>
    <v-data-table
      :headers="headers"
      :items="list"
      hide-actions
      class="elevation-1"
      :loading="loading"
      :no-data-text="nodatatext"
    >
      <template slot="items" slot-scope="props">
        <td class="text-xs-center">{{ props.item.chnl_name }}</td>
        <td class="text-xs-center">{{ props.item.chnl_name_en }}</td>
        <td class="text-xs-center">{{ props.item.chnlid }}</td>
        <td class="text-xs-center">{{ props.item.trade_type | tradeType(tradeTypes) }}</td>
        <td class="text-xs-center">{{ props.item.weeks_ratio }}</td>
        <td class="text-xs-center">{{ props.item.weekend_ratio }}</td>
        <td class="text-xs-center">{{ props.item.available | statusFilter }}</td>
        <td class="justify-center layout align-center">
          <v-btn color="primary" @click="edit(props.item)">编辑</v-btn>
        </td>
      </template>
    </v-data-table>
    <div class="pagination-container">
      <span class="pagination-total">共 {{totalItems}} 条</span>
      <v-select
        :items="selectItems"
        height="20"
        label="10页/条"
        solo
        v-model="pageCount"
        @change="pagiChange"
      ></v-select>
      <v-pagination
        v-model="page"
        :length="pageNumber"
        :total-visible="7"
      ></v-pagination>
    </div>
    </v-card>
    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
      <v-form ref="form" v-model="valid" class="v-f">
        <v-text-field v-model="formItems.chnl_name" label="通道名称" required placeholder="请输入通道名称（中）" :rules="formItemsRule.chnl_name"></v-text-field>
        <v-text-field v-model="formItems.chnl_name_en" label="通道名称（英）" required placeholder="请输入通道名称（英）" :rules="formItemsRule.chnl_name_en"></v-text-field>
        <v-text-field v-model="formItems.chnlid" label="通道代码" required placeholder="请输入通道代码" :rules="formItemsRule.chnlid"></v-text-field>
        <v-select v-model="formItems.trade_type" :items="tradeTypes" item-text="val" item-value="key" no-data-text="暂无数据" placeholder="请选择交易类型" label="交易类型" :rules="formItemsRule.trade_type"></v-select>
        <v-text-field v-model="formItems.weeks_ratio" label="通道成本（工作日）" required placeholder="请输入通道成本（工作日）" :rules="formItemsRule.weeks_ratio"></v-text-field>
        <v-text-field v-model="formItems.weekend_ratio" label="通道成本（非工作日）" required placeholder="请输入通道成本（非工作日）" :rules="formItemsRule.weekend_ratio"></v-text-field>
        <v-select v-model="formItems.available" :items="availableItems" item-text="name" item-value="id" no-data-text="暂无数据" placeholder="请选择状态" label="状态" :rules="formItemsRule.available"></v-select>
        <v-text-field v-model="formItems.id" style="display: none"></v-text-field>
        <v-text-field v-model="formItems.fixed_fee" style="display: none"></v-text-field>
        <v-btn
          :disabled="!valid"
          @click="submit"
          color="primary"
          :loading="submitLoading"
        >
          保存
        </v-btn>
        <v-btn @click="cancel">取消</v-btn>
      </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import Http from '@/http'
export default {
  data () {
    return {
      src: '',
      imgShow: false,
      headers: [
        { text: '通道名称', align: 'center', sortable: false },
        { text: '通道名称（英）', align: 'center', sortable: false },
        { text: '通道代码', align: 'center', sortable: false },
        { text: '交易类型', align: 'center', sortable: false },
        { text: '通道成本（工作日）', align: 'center', sortable: false },
        { text: '通道成本（非工作日）', align: 'center', sortable: false },
        { text: '状态', align: 'center', sortable: false },
        { text: '操作', align: 'center', sortable: false }
      ],
      searchParams: {
        chnlid: '',
        trade_type: '',
        available: ''
      },
      list: [],
      showCtrl: false,
      page: 1,
      pageCount: 10,
      totalItems: '',
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
      nodatatext: '正在加载',
      loading: true,
      visi: false,
      stat: '',
      id: '',
      tType: '',
      tradeTypes: [],
      available: '',
      availableItems: [
        {id: '0', name: '关闭'},
        {id: '1', name: '开启'}
      ],
      dialog: false,
      submitLoading: false,
      formItems: {
        chnl_name: '',
        chnl_name_en: '',
        chnlid: '',
        trade_type: '',
        weeks_ratio: '',
        weekend_ratio: '',
        available: '',
        id: '',
        fixed_fee: ''
      },
      formItemsRule: {
        chnl_name: [
          v => !!v || '通道名称不能为空'
        ],
        chnl_name_en: [
          v => !!v || '通道英文名称不能为空'
        ],
        chnlid: [
          v => /^\d{1,6}$/.test(v) || '请输入六位以内整数'
        ],
        trade_type: [
          v => !!v || '交易类型不能为空'
        ],
        weeks_ratio: [
          v => (/^\d+.?\d{0,6}$/.test(v) && v <= 1) || '请输入不超过1的数字 小数限定六位'
        ],
        weekend_ratio: [
          v => (/^\d+.?\d{0,6}$/.test(v) && v <= 1) || '请输入不超过1的数字 小数限定六位'
        ],
        available: [
          v => !!v || '状态不能为空'
        ],
      },
      chnlid_arr: [],
      valid: false,
      mode: ''
    }
  },
  computed: {
    'pageNumber': function () {
      return Math.ceil(this.totalItems / this.pageCount)
    }
  },
  watch: {
    'page': function (val) {
      this.getList()
    }
  },
  filters: {
    tradeType: function (val, arr) {
      let name = ''
      const item = arr.filter(v => v.key == val)
      name = item[0] && item[0]['val']
      return name
    },
    statusFilter: function (val) {
      const obj = {
        '0': '关闭',
        '1': '开启'
      }
      return obj[val]
    }
  },
  methods: {
    add () {
      this.dialog = true
      this.mode = 'add'
    },
    pagiChange () {
      this.getList()
    },
    async getList () {
      this.loading = true
      // 不做分页查询 返回全部
      let res = await Http.post(`/chnltrade/manage/list?page=${this.page}&pagesize=${this.pageCount}`, this.searchParams)
      this.loading = false
      this.list = [...res.list]
      if (this.list.length === 0) {
        this.nodatatext = '暂无数据'
      }
      this.list.map(item => {
        item.available = item.available.toString()
      })
      this.totalItems = res.total
      
    },
    async submit () {
      if (!this.$refs.form.validate()) {
        return
      }
      if (this.formItems.hasOwnProperty('id') && !this.formItems.id && this.mode == 'add') {
        delete this.formItems.id
      }
      if (this.formItems.hasOwnProperty('fixed_fee') && this.mode == 'add') {
        delete this.formItems.fixed_fee
      }
      this.submitLoading = true
      let res = await Http.post(`/chnltrade/manage/handle`, this.formItems)
      this.submitLoading = false
      this.$refs.form.reset()
      this.dialog = false
      if (!res.respcd || res.respcd == '0000') {
        this.$store.dispatch('setSnackbar', {
          showSnackbar: true,
          snackbarText: '操作成功'
        })
      }
      this.getList()
    },
    edit (item) {
      this.dialog = true
      this.mode = 'edit'
      this.formItems = {...item}
    },
    async getTradeTypes () {
      let res = await Http.get(`/chnltrade/manage/tradetypes`)
      this.tradeTypes = [...res]
    },
    async getNameList () {
      let res = await Http.get(`/chnltrade/manage/namelist`)
      this.chnlid_arr = [...res]
    },
    cancel () {
      this.dialog = false
      this.$refs.form.reset()
    }
  },
  components: {
    //
  },
  created () {
    this.getTradeTypes()
    this.getList()
    this.getNameList()
  }
}
</script>
<style scoped lang="scss">
td{text-align: center;}
.f-wrap{
  display: flex;
  justify-content: flex-start;
}
.f-i{
  margin-right: 20px;
}
.v-f{
  width: 50%;
  margin: 0 auto;
  padding: 20px;
}
</style>
