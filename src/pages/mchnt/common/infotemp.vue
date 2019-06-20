<template>
  <div class="b-i-d-w">
    <div v-for="(item, index) in keys" :key="index" class="b-i-i">
      <div class="b-i-i-f">{{dict[item]}}:</div>
      <div v-if="item == 'iddate'">{{infos['idstatdate']}}至{{infos['idenddate']}}</div>
      <div v-else-if="item == 'mcc'">{{mccObj[infos['mcc']]}}</div>
      <div v-else-if="item == 'shop_type' && infos['has_top_shop'] == 1" class="b-i-t">
        <div class="b-i-i-f">总店id:</div>
        <div>{{infos['relation']}}</div>
      </div>
      <div v-else>{{infos[item]}}</div>
    </div>
  </div>
</template>
<script>
export default {
  props: [
    'keys',
    'dict',
    'infos',
    'mccObj'
  ],
  data () {
    return {
      //
    }
  }
}
</script>
<style>
.b-i-d-w{
  display: flex;flex-wrap: wrap;
}
.b-i-i{
  display: flex;flex-basis: 50%;line-height: 30px;font-size: 15px;
}
.b-i-i-f{
  margin-right: 10px;
}
.b-i-t{
  display: flex;margin-left: 20px;
}
</style>

