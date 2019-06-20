<template>
    <v-dialog
        v-model="isShowDialog_new"
        width="40%"
        transition="dialog-bottom-transition"
        >
        <v-card>
            <v-card-title style="background:#00b3e3 !important;color: #fff">
                <span class="headline">短信模版新增</span>
            </v-card-title>
            <v-form ref="dialog_form" lazy-validation class="dialog-form">
                <v-container grid-list-md>
                    <v-layout wrap>
                        <div v-for="item in select_items" :key="item.id">
                            <v-autocomplete
                                :label="item.label" hide-details
                                v-model="item.value"
                                :hint="`${select.value}, ${select.name}`"
                                :items="item.selected"
                                item-text="name"
                                item-value="value"
                            >
                            </v-autocomplete>
                        </div>
                        <div v-for="item in textarea_item" :key="item.id">
                            <v-text-field :label="item.label" v-model="item.value"/>
                         </div>
                    </v-layout>
                </v-container>
            </v-form>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" flat @click="cancel()">取消</v-btn>
                <v-btn color="primary" @click="submit()">提交</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
export default {
  name: "child",
  props: [
    'select_items',
    'textarea_item'
  ],
  data() {
    return {
        select: { name: '', value: ''},
        isShowDialog_new: true
    }
  },
  methods:{
    submit () {
      this.$emit('confirmFun')
    },
    cancel () {
      this.$refs.dialog_form.reset()
      this.$emit('cancelFun')
    }
  }
}
</script>
<style scoped>
.v-text-field {
    margin: 15px;
}
</style>

