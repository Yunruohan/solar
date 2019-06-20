<template>
  <v-form valid="valid" ref="addForm">
    <div class="f-t">商户基本信息</div>
    <div class="f-f">
      <v-text-field class="w-40 mr-50" v-model="formData.name" label="姓名" :rules="formRule.name" :disabled="isEditing"></v-text-field>
      <v-text-field class="w-40" v-model="formData.mobile" label="手机号" :rules="formRule.mobile" :disabled="isEditing"></v-text-field>
    </div>
    <div class="f-f">
      <v-select class="w-40 mr-50" :items="idType" placeholder="请选择证件类型" v-model="idc" label="证件类型" :disabled="isEditing"></v-select>
      <v-text-field class="w-40" v-model="formData.idnumber" label="证件号码" :rules="formRule.idnumber" :disabled="isEditing"></v-text-field>
    </div>
    <div class="f-t">账户信息</div>
    <div class="f-f">
      <v-text-field class="w-40 mr-50" v-model="formData.bankaccount" label="账号" :rules="formRule.bankaccount"></v-text-field>
      <v-text-field class="w-40" v-model="formData.bankmobile" label="银行预留手机号" :rules="formRule.bankmobile"></v-text-field>
    </div>
    <div class="f-f">
      <v-autocomplete class="w-40 mr-50" v-model="formData.headbankname" :rules="formRule.headbankname" item-text="headbankname" item-value="id" :items="banks" placeholder="请选择开户行" label="开户行" @change="getBrchBanks"></v-autocomplete>
      <div class="f-d w-40">
        <v-autocomplete v-model="formData.bankProvince" :rules="formRule.bankProvince" item-text="area_name" item-value="id" :items="provinces" placeholder="请选择开户省" label="开户省" @change="getCities"></v-autocomplete>
        <div class="f-l">-</div>
        <v-autocomplete v-model="formData.bankCity" :rules="formRule.bankCity" item-text="city_name" item-value="id" :items="cities" placeholder="请选择开户市" label="开户市"></v-autocomplete>
      </div>
    </div>
    <div class="f-f">
      <v-autocomplete class="w-40 mr-50" v-model="formData.bankname" :rules="formRule.bankname" item-text="brchbank_name" item-value="id" :items="brBanks" placeholder="请选择开户支行" label="开户支行"></v-autocomplete>
      <v-text-field class="w-40" style="visibility: hidden;"></v-text-field>
    </div>
    <div>
      <v-btn @click="submit" color="primary">提交申请</v-btn>
      <v-btn @click="cancel">取消</v-btn>
    </div>
  </v-form>
</template>
<script>
/* eslint-disable */
export default {
  props: [
    'formData',
    'formRule',
    'provinces',
    'cities',
    'idType',
    'banks',
    'refForm',
    'isEditing',
    'brBanks'
  ],
  data () {
    return {
      'idc': '身份证',
      'valid': false
    }
  },
  methods: {
    submit () {
      if (!this.$refs.addForm.validate()) {
        return
      }
      this.$emit('submit')
    },
    cancel () {
      this.$emit('cancel')
    },
    getCities () {
      this.$emit('getCities')
    },
    getBrchBanks () {
      this.$emit('getBrchBanks')
    }
  }
}
</script>
<style scoped>
.f-t{
  font-size: 18px;
}
.f-f{
  display: flex;
}
.mr-50{
  margin-right: 50px;
}
.w-40{
  width: 40%;
}
.f-d{
  display: flex;flex: 1 1 auto;align-items: center;
}
.f-l{
  margin: auto 10px;font-size: 20px;
}
</style>
