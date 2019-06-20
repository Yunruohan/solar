<template>
  <v-dialog v-model="dia" width="500" persistent>
    <v-card class="d-card">
      <div class="msg-w">{{msg}}</div>
      <div class="btn-w">
        <v-btn color="primary" @click="confirm">
          确定
        </v-btn>
        <v-btn @click="cancel">
          再想想
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  props: [
    'msg',
    'dia'
  ],
  methods:{
    confirm () {
      this.$emit('confirmFun')
    },
    cancel () {
      this.$emit('cancelFun')
    }
  }
}
</script>
<style scoped>
.msg-w{
  font-size: 20px;margin-bottom: 10px;
}
.d-card{
  padding: 20px;
}
.btn-w{
  text-align: end;
}
</style>
