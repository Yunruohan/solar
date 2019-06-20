<template>
  <v-dialog
    persistent
    v-model="isVisiable"
    max-width="290"
  >
    <v-card>
      <v-card-title v-if="title" class="headline">{{title}}</v-card-title>
      <v-card-text v-if="msg">{{msg}}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" flat small @click="$emit('okHandler')">确定</v-btn>
        <v-btn small flat @click="$emit('cancelHandler')">取消</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'Comfirm',
  props: {
    isVisiable: Boolean,
    title: String,
    msg: String
  },
  methods: {
  }
}
</script>
