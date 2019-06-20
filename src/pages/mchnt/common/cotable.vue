<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="datas"
      hide-actions
      class="elevation-1"
      :no-data-text="nodatatext"
    >
      <template slot="items" slot-scope="props">
        <td class="text-xs-center" v-for="(k, index) in keys" :key="index">
          <v-text-field class="t-c" v-model="props.item[k]" v-if="(['ratio', 'max_fee', 'amt', 'contract_no', 'license_address'].indexOf(k) > -1) && edit" :rules="formrules[k]"></v-text-field>
          <v-text-field class="t-c" v-model="props.item[k]" v-else-if="(['second_ratio'].indexOf(k) > -1) && edit" :rules="formrules[k]" :disabled="Number(props.item.ratio) === -1 || props.item.ratio === ''"></v-text-field>
          <el-date-picker
            v-else-if="(['contract_sdate', 'contract_edate', 'licensestat_date', 'licenseend_date'].indexOf(k) > -1) && edit"
            v-model="props.item[k]"
            type="date"
            :placeholder="props.item[k]"
            value-format="yyyy-MM-dd">
          </el-date-picker>
          <div v-else>{{ props.item[k] }}</div>
        </td>
      </template>
    </v-data-table>
  </div>
</template>
<script>
export default {
  props: [
    'headers',
    'datas',
    'nodatatext',
    'keys',
    'edit',
    'proRule'
  ],
  data () {
    return {
      formrules: {
        contract_no: [
          v => /^[^\u2E80-\u9FFF`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]*$/.test(v) || '不支持特殊字符和汉字',
          v => /^[a-zA-Z0-9]{0,40}$/.test(v) || '长度限制40个字符'
        ],
        ratio: [
          v => /^(\-)?\d+(\.\d+)?$/.test(v) || '请输入数字',
          v => /^(\-)?\d+(\.\d{1,4})?$/.test(v) || '小数点后最多可输入四位',
          v => (v>=0 && v<1) || '数字需大于等于0小于1'
        ],
        second_ratio: [
          v => /^(\-)?\d+(\.\d+)?$/.test(v) || '请输入数字',
          v => /^(\-)?\d+(\.\d{1,4})?$/.test(v) || '小数点后最多可输入四位',
          v => (v>=0 && v<1) || '数字需大于等于0小于1'
        ],
        max_fee: [
          v => /^(\-)?\d+(\.\d+)?$/.test(v) || '请输入数字',
          v => /^(\-)?\d+(\.\d{1,4})?$/.test(v) || '小数点后最多可输入四位',
          v => (v>=0 && v<1) || '数字需大于等于0小于1'
        ],
        license_address: [v => v.length <= 256 || '限制字符256以内']
      }
    }
  }
}
</script>
<style scoped>
.t-c{
  text-align: center;
}
</style>
