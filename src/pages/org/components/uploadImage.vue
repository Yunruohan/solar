<template>
  <div class="uploadImage">
    <h3>{{label}}</h3>
    <input ref="inputfile" type="file" accept="image/jpg,image/png,image/jpeg" @change="fileReader($event.target.files)"/>
    <img :src="imgUrl"/>
    <v-progress-circular v-show="isPending" indeterminate color="grey lighten-5"></v-progress-circular>
  </div>
</template>

<script>
// import qs from 'qs'
export default {
  props: {
    label: String
  },
  data () {
    return {
      imgUrl: '',
      isPending: false
    }
  },
  methods: {
    fileReader (selectorFiles) {
      this.isPending = true
      let reader = new FileReader()
      let _this = this
      reader.onloadend = function (e) {
        _this.imgUrl = e.target.result
        _this.uploadImage(e.target.result)
      }
      reader.readAsDataURL(selectorFiles[0])
    },
    dataURLtoBlob (dataurl) {
      let arr = dataurl.split(',')
      let mime = arr[0].match(/:(.*?);/)[1]
      let bstr = atob(arr[1])
      let n = bstr.length
      let u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new Blob([u8arr], { type: mime })
    },
    uploadImage (dataURL) {
      // 字符内容转变成blob格式
      let blob = this.dataURLtoBlob(dataURL)
      let formData = new FormData()
      formData.append('file', blob)
      formData.append('tag', 'idcardfront')
      formData.append('enuserid', 'NwBKdNEt')
      formData.append('category', 1)
      formData.append('source', 1)
      formData.append('format', 'cors')
      this.$http({
        url: 'http://172.100.111.45:8080/util/v1/uploadfile',
        method: 'POST',
        data: formData
      }).then(res => {
        this.isPending = false
        if (res.respcd === '0000') {
          this.imgUrl = res.url
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .uploadImage  {
    position: relative;
    overflow: hidden;
    background-color: #ccc;
    h3 {
      text-align: center;
      font-size: 14px;
      color: #eaeaea;
      background-color: rgba(0, 0, 0, 0.5);
      position: absolute;
      width: 100%;
      bottom: 0;
    }
    input {
      cursor: pointer;
      opacity: 0;
      position: absolute;
      width: 100%;
      height: 100%;
    }
    img {
      width: 100%;
    }
    .v-progress-circular {
      position: absolute;
      left: 50%;
      top: 50%;
      margin-top: -16px;
      margin-left: -16px;
    }
  }
</style>
