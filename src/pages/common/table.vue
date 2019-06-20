<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="datas"
      hide-actions
      class="elevation-1"
      :no-data-text="nodatatext"
    >
      <template slot="items" slot-scope="props">
        <td class="text-xs-center" v-for="(k, index) in keys" :key="index">
          <div>{{ props.item[k] }}</div>
        </td>
      </template>
    </v-data-table>
    <div class="pagination-container">
        <span class="pagination-total">共 {{total}} 条</span>
        <v-select
            v-model=        
            "pageSize"
            :items="selectItems"
            @change="fetchData()"
            height="20"
            label="10页/条"
            solo
        ></v-select>
        <v-pagination
            v-model="page"
            @input="fetchData()"
            :total-visible="7"
        ></v-pagination>
     </div>
  </div>
</template>
<script>
export default {
  props: [
    'headers',
    'datas',
    'keys',
    'total'
  ],
  data () {
    return {
        nodatatext: '正在拼命加载',
        page: 0,
        pageSize: 0,
        selectItems: [{
            value: 10,
            text: '10条/页'
        }, {
            value: 20,
            text: '20条/页'
        }, {
            value: 50,
            text: '50条/页'
        }] 
    }
  },
  methods: {
    fetchData () {
      this.$emit('fetchData')
    },
  }
}
</script>
<style scoped>
.t-c{
  text-align: center;
}
</style>
