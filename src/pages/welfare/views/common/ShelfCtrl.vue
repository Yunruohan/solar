<template>
  <v-dialog
    v-model="visi"
    width="400" persistent
  >
    <v-card>
      <v-card-text v-if="type == 'ad'">
        确定{{status ? '上架' : '下架'}}该广告吗?
      </v-card-text>
      <v-card-text v-if="type == 'coupon'">
        确定{{status ? '上架' : '下架'}}该优惠券吗？
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="offCtrl" small
        >
          确定
        </v-btn>
        <v-btn
          @click="close" small
        >
          取消
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import Http from '@/http'
export default {
  props: [
    'type',
    'status',
    'id',
    'visi'
  ],
  data () {
    return {
    }
  },
  methods: {
    close () {
      this.$emit('close')
      this.$emit('statusCtrl')
    },
    async offCtrl () {
      let res
      if (this.type === 'ad') {
        res = await Http.post('/travel/banner/options', {
          up_lower: Number(this.status),
          mode: 'change_state',
          id: this.id
        })
      } else if (this.type === 'coupon') {
        res = await Http.post('/travel/goods/options', {
          status: Number(this.status),
          mode: 'change_info',
          id: this.id
        })
      }
      if (res && res.data) {
        if (res.data.respcd === '0000') {
          this.$emit('close')
          this.$emit('ctrl')
          this.$store.dispatch('setAlert', {
            alert: true,
            alertContent: '操作成功',
            alertType: 'success'
          })
        } else {
          // 问题提示
          this.$store.dispatch('setAlert', {
            alert: true,
            alertContent: res.data.respmsg,
            alertType: 'error'
          })
        }
      }
    }
  }
}
</script>
<style scoped>
.v-head-cus{text-align: center;width: 100%;position: relative;}
.f-r{float: right;}
</style>
