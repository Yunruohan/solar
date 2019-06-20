<template>
  <div id="uploadImagesContainer">
    <h3 class="v-label theme--light mb-2">{{label}}</h3>
    <figure v-for="(item, index) in previewImages" :key="index" :class="[{'isEdit':modifyStatus[index]}, 'elevation-2']">
      <img :src="item" @click.self="goEdit(index)"/>
      <v-icon class="delete-icon" color="white" @click.self="comfirm(index)">close</v-icon>
      <v-btn flat>
        <input ref="inputfile" type="file" accept="image/jpg,image/png,image/jpeg" @change="beforeUpload($event.target.files, index)"/>
        <v-icon class="edit-icon" color="white">edit</v-icon>
      </v-btn>
      <p v-show="failStatus[index]" class="fail">上传失败</p>
      <div @click.self="goEdit(index)" class="mask transition-fast-in-fast-out"/>
      <v-progress-linear :class="{'show': pendingStatus[index]}" :indeterminate="true"></v-progress-linear>
    </figure>
    <div id="addImage" v-show="!readonly && showAddBtn">
      <v-icon large>add</v-icon>
      <input ref="inputfile" type="file" accept="image/jpg,image/png,image/jpeg" @change="beforeUpload($event.target.files, -1)"/>
    </div>
    <comfirm @okHandler="deleteImage()" @cancelHandler="showComfirm = false" :isVisiable="showComfirm" msg="确定删除当前图片吗？"/>
  </div>
</template>

<script>
import Comfirm from '@/components/Comfirm'
export default {
  props: {
    label: String,
    maxNumber: Number,
    readonly: Boolean,
    imgs: Array
  },
  components: {
    Comfirm
  },
  data () {
    return {
      modifyStatus: [], // 编辑状态
      pendingStatus: [], // 上传等待中状态
      failStatus: [], // 上传失败
      previewImages: [], // FileReader 本地预览图片 上传完会换成正式的
      showComfirm: false,
      currentIndex: 0, // 当前正在操作的按钮
      showAddBtn: true
    }
  },
  methods: {
    goEdit (index) {
      if (this.readonly) {
        return
      }
      let toggle = !this.modifyStatus[index]
      this.modifyStatus.splice(index, 1, toggle)
    },
    comfirm (index) {
      this.currentIndex = index
      this.showComfirm = true
    },
    deleteImage () {
      this.previewImages.splice(this.currentIndex, 1)
      this.modifyStatus.splice(this.currentIndex, 1)
      this.pendingStatus.splice(this.currentIndex, 1)
      this.failStatus.splice(this.currentIndex, 1)
      this.showComfirm = false
      if (this.previewImages.length < this.maxNumber) {
        this.showAddBtn = true
      }
    },
    beforeUpload (selectorFiles, index) {
      // let filesize = selectorFiles[0].size
      // if (filesize > 500) {
      //   // this.$message.error('请上传小于5M图片')
      //   return false
      // }
      if (selectorFiles.length === 0) {
        return false
      }
      let ext = selectorFiles[0].type.split('/')[1]
      this.$http.get('https://openapi.qfpay.com/tool/v1/qiniu_token', {
        params: {
          appcode: '40F12F92A55747B8AD759E05968A331D',
          func: 'upload',
          format: 'cors',
          ext
        }
      }).then((res) => {
        let data = res.data
        if (data.respcd === '0000') {
          let token = data.data.token
          let key = data.data.key
          this.fileReader(selectorFiles, token, key, index)
        }
      }).catch(() => {
        console.log('网络错误')
      })
    },
    fileReader (selectorFiles, token, key, index) {
      let reader = new FileReader()
      let _this = this
      reader.onloadend = function (e) {
        if (index >= 0) {
          _this.previewImages.splice(index, 1, e.target.result)
          _this.pendingStatus.splice(index, 1, true)
        } else {
          _this.previewImages.push(e.target.result)
          _this.pendingStatus.push(true)
          _this.failStatus.push(false)
          _this.modifyStatus.push(false)
        }
        _this.uploadImage(e.target.result, token, key, index)
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
    uploadImage (dataURL, token, key, index) {
      // 字符内容转变成blob格式
      let blob = this.dataURLtoBlob(dataURL)
      let formData = new FormData()
      formData.append('file', blob)
      formData.append('token', token)
      formData.append('key', key)
      this.$http.post('https://upload.qiniu.com/', formData)
        .then((res) => {
          let url = `https://near.qfpay.com.cn/${res.data.key}`
          this.pendingStatus.splice(index, 1, false)
          this.previewImages.splice(index, 1, url)
          this.failStatus.splice(index, 1, false)
          if (this.maxNumber === this.previewImages.length) {
            this.showAddBtn = false
          }
        })
        .catch(() => {
          this.pendingStatus.splice(index, 1, false)
          this.modifyStatus.splice(index, 1, true)
          this.failStatus.splice(index, 1, true)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
#uploadImagesContainer {
  .v-label {
    font-weight: normal;
    font-size: 12px;
  }
  figure {
    width: 160px;
    height: 160px;
    display: inline-block;
    cursor: pointer;
    overflow: hidden;
    margin-right: 20px;
    margin-bottom: 15px;
    position: relative;
    transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
    > img {
      width: 100%;
      height: 100%;
    }
    &:hover {
      box-shadow: 0px 6px 12px rgba(0,0,0,0.2);
    }
    .v-progress-linear {
      display: none;
      position: absolute;
      bottom: 0;
      left: 0;
      margin: 0;
    }
    .mask {
      position: absolute;
      top: 0;
      left: 0;
      background-color: rgba(245,124,0,0.5);
      width: 100%;
      height: 100%;
      transform: translateY(100%);
    }
    .v-icon, .v-btn {
      opacity: 0;
    }
    .delete-icon {
      cursor: pointer;
      position: absolute;
      z-index: 10;
      top: 6px;
      right: 6px;
    }
    .v-btn { // 更新按钮
      position: absolute;
      right: 6px;
      bottom: 6px;
      z-index: 10;
      width: 24px;
      height: 24px;
      overflow: hidden;
      min-width: 24px;
      margin: 0;
      padding: 0;
      input {
        cursor: pointer;
        opacity: 0;
        position: absolute;
      }
    }
    .edit-icon {
      right: 6px;
      bottom: 6px;
    }
    &.isEdit {
      .v-icon, .v-btn {
        opacity: 1;
      }
      .mask {
        transform: translateY(0);
      }
    }
  }
  .fail {
    position: absolute;
    top: 50%;
    left: 0;
    z-index: 5;
    width: 100%;
    background-color: rgba(162, 0, 0, 0.5);
    height: 30px;
    line-height: 30px;
    color: #fff;
    text-align: center;
  }
}
#addImage {
  width: 160px;
  height: 160px;
  display: inline-block;
  vertical-align: top;
  position: relative;
  line-height: 160px;
  text-align: center;
  border: 1px solid rgba(0,0,0,.42);
  input {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    cursor: pointer;
    opacity: 0;
  }
}
</style>
