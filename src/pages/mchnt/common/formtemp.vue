<template>
  <v-form ref="commonForm">
    <v-flex v-for="(item, index) in formKeys" :key="index">
      <v-flex v-if="item == 'iddate'">
        <el-date-picker
          v-model="formData.iddate"
          type="daterange"
          value-format="yyyy-MM-dd"
          range-separator="至"
          start-placeholder="身份证有效期开始日期"
          end-placeholder="身份证有效期结束日期">
        </el-date-picker>
      </v-flex>
      <v-select v-else-if="item == 'user_type'" v-model="formData['user_type']" :items="userTypes" item-text="name" item-value="id" no-data-text="暂无数据" placeholder="请选择商户类型" label="商户类型"></v-select>
      <v-select v-else-if="item == 'state'" v-model="formData['state']" :items="userStates" item-text="name" item-value="id" no-data-text="暂无数据" placeholder="请选择商户状态" label="商户状态"></v-select>
      <v-select v-else-if="item == 'business_uid'" v-model="formData['business_uid']" :items="salesList" item-text="name" item-value="id" no-data-text="暂无数据" placeholder="请选择业务员" label="业务员"></v-select>
      <v-select v-else-if="item == 'mcc'" v-model="formData['mcc']" :items="mccList" item-text="mcc_name" item-value="id" no-data-text="暂无数据" placeholder="请选择经营类型" label="经营类型"></v-select>
      <v-text-field v-model="formData[item]" :label="formDict[item]" :rules="formRule[item]" v-else-if="item == 'groupid'" @change="getSales"></v-text-field>
      <v-text-field v-model="formData[item]" :label="formDict[item]" :rules="formRule[item]" v-else></v-text-field>
    </v-flex>
    <div>
      <v-btn @click="confirm" color="primary">确定</v-btn>
      <v-btn @click="cancel">取消</v-btn>
    </div>
  </v-form>
</template>
<script>
export default {
  props: [
    'formData',
    'formKeys',
    'formDict',
    'formRule',
    'userStates',
    'userTypes',
    'salesList',
    'mccList'
  ],
  data () {
    return {
      test: ''
    }
  },
  methods: {
    confirm () {
      if (!this.$refs.commonForm.validate()) {
        return
      }
      this.$emit('confirm')
    },
    cancel () {
      this.$emit('cancel')
    },
    getSales () {
      this.$emit('getSales')
    }
  }
}
</script>
