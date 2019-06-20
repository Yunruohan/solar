<template>
  <v-dialog
    v-model="dialog" width="600px"
  >
    <v-icon
      slot="activator"
      color="primary"
    >details</v-icon>
    <v-card>
      <v-card-title>
      <div class="v-head-cus">
        <span>查看详情</span>
        <v-icon class="f-r" @click="dialog = false">close</v-icon>
      </div>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text v-if="item">
        <v-layout row class="v-cou-detail">
            <v-flex class="v-flex-title-cus">ID:</v-flex>
            <v-flex>{{item.id}}</v-flex>
        </v-layout>
        <v-layout row class="v-cou-detail">
            <v-flex class="v-flex-title-cus">名称:</v-flex>
            <v-flex class="v-flex-content-cus">{{item.name}}</v-flex>
        </v-layout>
        <v-layout row class="v-cou-detail">
            <v-flex class="v-flex-title-cus">列表图片:</v-flex>
            <v-flex><img @click="showImg(item.images[0])" :src='item.images[0]' aspect-ratio="1.7" v-if="item.images && item.images.length" class="v-img-cus"/></v-flex>
        </v-layout>
        <v-layout row class="v-cou-detail">
            <v-flex class="v-flex-title-cus">使用条件:</v-flex>
            <v-flex class="v-flex-content-cus">{{item.term}}</v-flex>
        </v-layout>
        <v-layout row class="v-cou-detail">
            <v-flex class="v-flex-title-cus">描述:</v-flex>
            <v-flex class="v-flex-content-cus">{{item.intro}}</v-flex>
        </v-layout>
        <v-layout row class="v-cou-detail">
            <v-flex class="v-flex-title-cus">详细图片:</v-flex>
            <v-flex><img @click="showImg(item.details[0])" :src='item.details[0]' aspect-ratio="1.7" v-if="item.details && item.details.length" class="v-img-cus"/></v-flex>
        </v-layout>
        <v-layout row class="v-cou-detail">
            <v-flex class="v-flex-title-cus">有效期:</v-flex>
            <v-flex>{{item.start_date.split(' ')[0]}} 至 {{item.end_date.split(' ')[0]}}</v-flex>
        </v-layout>
        <v-layout row class="v-cou-detail">
            <v-flex class="v-flex-title-cus">使用时间段:</v-flex>
            <v-flex>{{item['cut_expire'][0]['start_time']}} 至 {{item['cut_expire'][0]['end_time']}}</v-flex>
        </v-layout>
        <v-layout row class="v-cou-detail">
            <v-flex class="v-flex-title-cus">关联商户:</v-flex>
            <v-flex>{{item.userid}}</v-flex>
        </v-layout>
        <v-layout row class="v-cou-detail">
            <v-flex class="v-flex-title-cus">兑换门店:</v-flex>
            <v-flex class="v-flex-content-cus">
              <v-chip v-for="(_item, _index) in item.exchange" :key="_index" text-color="white" color="green">{{_item.name}}</v-chip>
            </v-flex>
        </v-layout>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <coupon-add :item="item" @ctrl="edit"/>
        <v-btn @click.stop="dialog = false" class="v-can-btn-cus">
          取消
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-dialog
      v-model="imgShow" attach=".coupon"
    >
      <v-card class="pa-0" d-flex>
        <img :src="src" alt="" style="max-width: 100%;">
      </v-card>
    </v-dialog>
  </v-dialog>
</template>
<script>
import CouponAdd from './CouponAdd'
export default {
  props: [
    'item'
  ],
  data () {
    return {
      dialog: false,
      imgShow: false,
      src: ''
    }
  },
  methods: {
    edit () {
      this.dialog = false
      this.$emit('ctrl')
    },
    showImg (src) {
      this.src = src
      this.imgShow = true
    }
  },
  components: {
    CouponAdd
  },
  created () {
  }
}
</script>
<style scoped>
.v-head-cus{text-align: center;width: 100%;position: relative;}
.f-r{float: right;}
.v-flex-title-cus{
  width: 100px;
  flex-grow: 0;
  text-align: right;
  margin-right: 20px;
  flex-shrink: 0;
}
.v-img-cus{width: 100px;}
.v-can-btn-cus{margin-left: 12px;}
.v-cou-detail{margin: 10px 0;}
.v-flex-content-cus{
  overflow-wrap: break-word;max-width: 75%;
}
</style>
