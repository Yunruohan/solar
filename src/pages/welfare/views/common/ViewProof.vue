<template>
  <v-dialog
    v-model="dialog"
    width="400"
  >
    <v-btn
      slot="activator"
      color="primary"
      small
    >
      上传凭证
    </v-btn>
    <v-card>
      <v-card-title>
      <div class="v-head-cus">
        <span>上传凭证</span>
        <v-icon class="f-r" @click="dialog = false">close</v-icon>
      </div>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        上传凭证后，订单变为已确认状态，无法更新凭证，请确保核销凭证无误
      </v-card-text>
      <v-card-text class="proof-load-holder">
        <p class="proof-title">核销凭证</p>
        <uploadImage ref="uploadimage" :maxNumber="1" class="mr-2"/>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="submit" small
        >
          保存
        </v-btn>
        <v-btn
          @click="dialog = false" small
        >
          取消
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import UploadImage from '../../components/UploadImage'
import Http from '@/http'
export default {
  props: [
    'item'
  ],
  data () {
    return {
      dialog: false,
      loading3: false
    }
  },
  watch: {
    'dialog': function (val) {
      if (val && this.item) {
        this.$refs.uploadimage.previewImages.splice(0, 1, this.item.proof)
        this.$refs.uploadimage.showAddBtn = false
      }
    }
  },
  methods: {
    async submit () {
      let img = this.$refs.uploadimage.previewImages[0]
      if (this.item && this.item.id && img) {
        let res = await Http.post('/travel/order/options', {
          proof: img,
          orderid: this.item.id,
          status: 1
        })
        if (res && res.data) {
          if (res.data.respcd === '0000') {
            this.dialog = false
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
  },
  components: {
    UploadImage
  }
}
</script>
<style scoped>
.v-head-cus{text-align: center;width: 100%;position: relative;}
.f-r{float: right;}
.proof-load-holder{display: flex;align-items: center;}
.proof-title{margin-right: 10px;}
</style>
