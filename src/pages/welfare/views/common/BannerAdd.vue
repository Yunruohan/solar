<template>
  <v-layout row :class="item ? 'justify-center': 'justify-end'">
    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-icon slot="activator" color="primary" small v-if="item">
        edit
      </v-icon>
      <v-btn slot="activator" color="primary" dark v-else>新增banner</v-btn>
      <v-toolbar dark color="primary" class="cus-toolbar">
        <v-toolbar-title align-self-center v-if="item">编辑BANNER</v-toolbar-title>
        <v-toolbar-title align-self-center v-else>新增BANNER</v-toolbar-title>
        <v-btn icon dark @click.native="dialog = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-form ref="form" v-model="valid" lazy-validation class="banner-form">
        <v-text-field
          v-model="name"
          :rules="nameRules"
          :counter="20"
          label="名称"
          required
        ></v-text-field>
        <v-layout row align-end>
          <uploadImage ref="uploadimage" :maxNumber="1" class="mr-2" label="图片"/>
          <p class="ma-0 pa-0 line-h-50"><span>*&nbsp;</span>jpg格式，200k，推荐尺寸750*256</p>
        </v-layout>
        <v-text-field
          v-model="url"
          label="链接"
        ></v-text-field>
        <v-text-field
          v-model="weight"
          :rules="weightRules"
          label="权重"
          required
        ></v-text-field>
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
    </v-dialog>
  </v-layout>
</template>
<script>
/* eslint-disable */
import UploadImage from '../../components/UploadImage'
import Http from '@/http'
export default {
  props: [
    'item'
  ],
  data () {
    return {
      dialog: false,
      valid: true,
      name: '',
      nameRules: [
        v => !!v || '请填写名称',
        v => (v && v.length <= 20) || '最多20个字'
      ],
      url: '',
      weight: '',
      weightRules: [
        v => !!v || v === 0 || '请填写权重',
        v => /^[0-9]*$/.test(v) || '数值越小，权重越高，优先展示'
      ],
      imgs: [],
      submitLoading: false
    }
  },
  methods: {
    async submit () {
      if (this.url) {
        let reg = /(((http|https)\:\/\/)|(www)){1}[a-zA-Z0-9\.\/\?\:@\-_=#]+\.([a-zA-Z0-9\&\.\/\?\:@\-_=#])*/g
        let isUrl = reg.test(this.url)
        if (!isUrl) {
          this.$store.dispatch('setAlert', {
            alert: true,
            alertContent: '请填写正确链接地址',
            alertType: 'warning'
          })
          return
        }
      }
      let img = this.$refs.uploadimage.previewImages[0]
      if (!img) {
        this.$store.dispatch('setAlert', {
          alert: true,
          alertContent: '请上传图片',
          alertType: 'warning'
        })
        return
      }
      let param = {
        image: img,
        url: this.url,
        name: this.name,
        weight: this.weight
      }
      let res
      if (this.$refs.form.validate()) {
        this.submitLoading = true
        if (this.item && this.item.id) {
          param.id = this.item.id
          param.mode = 'change_info'
          res = await Http.post('/travel/banner/options', param)
        } else {
          param.mode = 'add_banner'
          res = await Http.post('/travel/banner/options', param)
        }
        this.submitLoading = false
        if (res && res.data) {
          if (res.data.respcd === '0000') {
            this.$emit('ctrl')
            this.cancel()
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
    },
    cancel () {
      this.dialog = false
      this.$refs.form.reset()
      this.$refs.uploadimage.previewImages = []
      this.$refs.uploadimage.showAddBtn = true
    }
  },
  watch: {
    'dialog': function (val) {
      if (val && this.item) {
        this.name = this.item.name
        this.url = this.item.url
        this.weight = this.item.weight
        this.$refs.uploadimage.previewImages.splice(0, 1, this.item.image)
        this.$refs.uploadimage.showAddBtn = false
      }
      if (!val) {
        this.cancel()
      }
    }
  },
  components: {
    UploadImage
  }
}
</script>
<style scoped>
.line-h-50{line-height: 50px;}
.text-field-cus{margin: 0 10px 0 50px;padding: 0;width: 300px;flex-grow: 0;flex-shrink: 0;}
.layout-row-cus{width: 50%;margin: 0 auto;flex-grow: 0;}
.banner-form{margin: 0 auto;}
</style>
