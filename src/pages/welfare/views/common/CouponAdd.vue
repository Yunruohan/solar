<template>
  <v-layout row justify-end>
    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-btn slot="activator" color="primary" v-if="item">
        编辑
      </v-btn>
      <v-btn slot="activator" color="primary" dark v-else>新增优惠券</v-btn>
      <v-toolbar dark color="primary" class="cus-toolbar">
        <v-toolbar-title align-self-center v-if="item">编辑优惠券</v-toolbar-title>
        <v-toolbar-title align-self-center v-else>新增优惠券</v-toolbar-title>
        <v-btn icon dark @click.native="dialog = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-form ref="form" v-model="valid" lazy-validation class="banner-form">
        <v-text-field
          v-model="name"
          :rules="nameRules"
          :counter="40"
          label="名称"
          required
        ></v-text-field>
        <v-layout row align-end>
          <uploadImage ref="uploadimage1" :maxNumber='1' class="mr-2" label="首页图片"/>
          <p class="ma-0 pa-0 line-h-50"><span>*&nbsp;</span>jpg格式，1张，不超过200k，推荐尺寸</p>
        </v-layout>
        <v-text-field
          v-model="term"
          :rules="termRules"
          :counter="40"
          label="使用条件"
          required
        ></v-text-field>
        <v-textarea
          v-model="intro"
          :rules="introRules"
          label="描述"
          counter="400"
        ></v-textarea>
        <v-layout row align-end>
          <uploadImage ref="uploadimage2" :maxNumber='1' class="mr-2" label="详情图片"/>
          <p class="ma-0 pa-0 line-h-50"><span>*&nbsp;</span>jpg格式，1张，不超过200k，推荐尺寸</p>
        </v-layout>
        <v-text-field
          v-model="total"
          :rules="totalRules"
          label="库存"
          required
        ></v-text-field>
        <v-layout row flex-end>
          <!-- 日期 -->
          <v-layout row wrap class="v-btn-cus" justify-space-between>
            <v-flex xs11 sm5>
        <v-menu
          ref="menu1"
          :close-on-content-click="false"
          v-model="menu1"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          max-width="290px"
          min-width="290px"
        >
          <v-text-field
            slot="activator"
            v-model="dateFormatted"
            label="开始日期"
            persistent-hint
            prepend-icon="event"
            @blur="date1 = parseDate(dateFormatted)"
          ></v-text-field>
          <v-date-picker :max="date2" v-model="date1" no-title @input="menu1 = false"></v-date-picker>
        </v-menu>
      </v-flex>

      <v-flex xs11 sm5>
        <v-menu
          :close-on-content-click="false"
          v-model="menu2"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          max-width="290px"
          min-width="290px"
        >
          <v-text-field
            slot="activator"
            v-model="computedDateFormatted"
            label="结束日期"
            persistent-hint
            prepend-icon="event"
            @blur="date2 = parseDate(computedDateFormatted)"
          ></v-text-field>
          <v-date-picker :min="date1" v-model="date2" no-title @input="menu2 = false"></v-date-picker>
        </v-menu>
      </v-flex>
          </v-layout>
        </v-layout>
        <v-layout row flex-end>
          <!-- 时间 -->
          <v-layout row wrap class="v-btn-cus" justify-space-between>
            <v-flex xs11 sm5>
              <v-menu
                ref="menu3"
                :close-on-content-click="false"
                v-model="menu3"
                :nudge-right="40"
                :return-value.sync="time1"
                lazy
                transition="scale-transition"
                offset-y
                full-width
                min-width="290px"
              >
                <v-text-field
                  slot="activator"
                  v-model="time1"
                  label="开始时间"
                  prepend-icon="access_time"
                  readonly
                ></v-text-field>
                <v-time-picker
                  format="24hr"
                  v-if="menu3"
                  v-model="time1"
                  full-width
                  :max="time2"
                  @change="$refs.menu3.save(time1)"
                ></v-time-picker>
              </v-menu>
            </v-flex>
            <v-flex xs11 sm5>
              <v-menu
                ref="menu4"
                :close-on-content-click="false"
                v-model="menu4"
                :nudge-right="40"
                :return-value.sync="time2"
                lazy
                transition="scale-transition"
                offset-y
                full-width
                min-width="290px"
              >
                <v-text-field
                  slot="activator"
                  v-model="time2"
                  label="结束时间"
                  prepend-icon="access_time"
                  readonly
                ></v-text-field>
                <v-time-picker
                  format="24hr"
                  v-if="menu4"
                  v-model="time2"
                  full-width
                  :min="time1"
                  @change="$refs.menu4.save(time2)"
                ></v-time-picker>
              </v-menu>
            </v-flex>
          </v-layout>
        </v-layout>
        <v-text-field
          v-model="userid"
          :rules="useridRules"
          label="关联商户id"
          required
          @blur="useridInput()()"
          @change="modelClean"
        ></v-text-field>
        <v-layout row align-end>
          <v-select
            v-model="model"
            :items="exchange"
            item-text="name"
            item-value="id"
            chips
            no-data-text="暂无数据"
            placeholder="请选择门店"
            label="选择门店"
            return-object
            multiple
          ></v-select>
        </v-layout>
        <v-layout row wrap>
          <v-flex v-for="(_item, _index) in model" :key="_index">
            <div class="chip-like-div">
              <span>{{_item.name}}</span>
              <v-icon color="white" @click="chipCtrl(_item)" small class="chip-like-icon">close</v-icon>
            </div>
          </v-flex>
        </v-layout>
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
        v => (v && v.length <= 40) || '最多40个字'
      ],
      introRules: [
        v => (v && v.length <= 400) || '最多400个字'
      ],
      term: '',
      termRules: [
        v => !!v || '请填写使用条件',
        v => (v && v.length <= 40) || '最多40个字'
      ],
      intro: '',
      total: '',
      totalRules: [
        v => (!!v && (v > 0)) || '请填写库存',
        v => /^[0-9]*$/.test(v) || '请填写数字'
      ],
      userid: '',
      useridRules: [
        v => !!v || '请填写关联商户id'
      ],
      imgs1: [],
      imgs2: [],
      dates: [],
      menu: false,
      menu1: false,
      time1: null,
      time2: null,
      menu2: false,
      menu3: false,
      menu4: false,
      isLoading: false,
      model: null,
      search: null,
      exchange: [],
      timer: null,
      date1: '',
      date2: '',
      storeData: [],
      submitLoading: false
    }
  },
  computed: {
    computedDateFormatted: {
      get () {
        return this.formatDate(this.date2)
      },
      set () {
        return this.formatDate(this.date2)
      }
    },
    dateFormatted: {
      get () {
        return this.formatDate(this.date1)
      },
      set () {
        return this.formatDate(this.date1)
      }
    }
  },
  methods: {
    formatDate (date) {
      if (!date) return null
      const [year, month, day] = date.split('-')
      return `${year}-${month}-${day}`
    },
    parseDate (date) {
      if (!date) return null
      const [month, day, year] = date.split('/')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    },
    chipCtrl (item) {
      let index = this.model.indexOf(item)
      this.model.splice(index, 1)
    },
    modelClean () {
      this.model = ''
    },
    async useridInput () {
      let res = await Http.post('/travel/goods/options', {
        id: this.userid,
        mode: 'shop_info'
      })
      if (res && res.data) {
        if (res.data.respcd === '0000') {
          let data = [...res.data.data]
          let exchange = []
          data.map(item => {
            exchange.push({
              name: item.name,
              id: item.id
            })
          })
          this.storeData = [...data]
          this.exchange = [...exchange]
        }
      }
    },
    async submit () {
      let image = this.$refs.uploadimage1.previewImages[0]
      if (!image) {
        this.$store.dispatch('setAlert', {
          alert: true,
          alertContent: '请上传首页图片',
          alertType: 'warning'
        })
        return
      }
      if (!this.date1) {
        this.$store.dispatch('setAlert', {
          alert: true,
          alertContent: '请选择开始日期',
          alertType: 'warning'
        })
        return
      }
      if (!this.date2) {
        this.$store.dispatch('setAlert', {
          alert: true,
          alertContent: '请选择结束日期',
          alertType: 'warning'
        })
        return
      }
      let arr = []
      let obj = {}
      obj.start_time = this.time1
      obj.end_time = this.time2
      arr.push(obj)
      if ((this.time1 || this.time2) && (!this.time1 || !this.time2)) {
        this.$store.dispatch('setAlert', {
          alert: true,
          alertContent: '请填写完整使用时间段',
          alertType: 'warning'
        })
        return
      }
      if (!this.model.length) {
        this.$store.dispatch('setAlert', {
          alert: true,
          alertContent: '门店不能为空',
          alertType: 'warning'
        })
        return
      }
      let details = this.$refs.uploadimage2.previewImages[0]
      let param = {
        images: JSON.stringify([image]),
        details: JSON.stringify([details]),
        name: this.name,
        term: this.term,
        intro: this.intro,
        total: this.total,
        userid: this.userid,
        type: 2,
        start_date: this.date1,
        end_date: `${this.date2} 23:59:59`,
        cut_expire: JSON.stringify(arr),
        exchange: JSON.stringify(this.model)
      }
      let res
      if (this.$refs.form.validate()) {
        this.submitLoading = true
        if (this.item && this.item.id) {
          param.id = this.item.id
          param.mode = 'change_info'
          res = await Http.post('/travel/goods/options', param)
        } else {
          param.mode = 'add_info'
          res = await Http.post('/travel/goods/options', param)
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
      this.$refs.uploadimage1.previewImages = []
      this.$refs.uploadimage1.showAddBtn = true
      this.$refs.uploadimage2.previewImages = []
      this.$refs.uploadimage2.showAddBtn = true
    }
  },
  watch: {
    'dialog': function (val) {
      if (val && this.item) {
        this.name = this.item.name
        this.term = this.item.term
        this.intro = this.item.intro
        this.total = this.item.total
        this.date1 = this.item.start_date
        this.date2 = this.item.end_date
        this.time1 = this.item['cut_expire'][0]['start_time']
        this.time2 = this.item['cut_expire'][0]['end_time']
        this.userid = this.item.userid
        this.model = [...this.item.exchange]
        this.exchange = [...this.model]
        this.$refs.uploadimage1.previewImages.splice(0, 1, this.item.images)
        this.$refs.uploadimage2.previewImages.splice(0, 1, this.item.details)
        this.$refs.uploadimage1.showAddBtn = false
        this.$refs.uploadimage2.showAddBtn = false
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
.chip-like-div{
  padding: 5px 10px;
  border: 1px solid;
  background: #4caf50 ;
  display: inline-block;
  border-radius: 5px;
  color: white;
}
.chip-like-icon{
  margin-left: 5px;
}
</style>
