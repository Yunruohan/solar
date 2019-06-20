<template>
    <div id="upgrade">
        <v-form ref="searchForm" class="search-form">
            <v-text-field label="商户ID" hide-details v-model="searchParams.userid"/>
            <v-text-field label="设备型号" hide-details v-model="searchParams.model"/>
            <v-text-field label="设备ID" hide-details v-model="searchParams.terminal_id"/>
            <div style="text-align:right">
                <v-btn @click="fetchData()" color="primary">查找</v-btn>
                <v-btn @click="reset()">重置</v-btn>
                <v-btn @click="envir_bind()" color="primary">灰度绑定</v-btn>
            </div>
        </v-form>
         <tableData ref="table" :headers="headers" :datas="List" :keys="keys" :total="total" @fetchData="fetchData()"></tableData>
        <child ref="child" v-if="isShowDialog_new" :textarea_item="textarea_item" :select_items="select_items" @cancelFun="cancel()" @submitFun="submit()"></child>
    </div>
</template>
<script>
import  Child  from '../../common/dialog.vue'
import  Table  from '../../common/table.vue'
export default {
    name: 'upgrade',
    components: {
        child: Child,
        tableData: Table
    },
    data() {
        return {
            select: { name: '', value:'' },
            mchnt_select: [
                { name: '全部', value: 1 },
                { name: '唱单宝', value: 2 },
                { name: '证通电子云喇叭', value: 3 }
            ],
            searchParams: {
                phone: '',
                speaker_id: '',
                mchnt_id: '',
                mchnt: ''
            },
            headers: [
                { text: '商户ID', value:'userid', align: 'center', sortable: false },
                { text: '设备型号', value:'model', align: 'center', sortable: false },
                { text: '版本号', value:'latest_ver', align: 'center', sortable: false },
                { text: '下载地址', value:'firmware_url', align: 'center', sortable: false },
                { text: '设备ID', value:'terminal_id', align: 'center', sortable: false },
                { text: '状态', value:'available', align: 'center', sortable: false },
                { text: '操作', align: 'center', sortable: false }
            ],
            keys: [ 'userid', 'model', 'latest_ver', 'firmware_url', 'terminal_id', 'available' ],
            List: [], 
            total: 0,
            isShowDialog_new: false,
            submit_type: 1, // 1表示喇叭绑定 2表示喇叭解绑
            textarea_item: [
                { id:1, label:"商户ID", model:"userid", value: ''},
                { id:2, label:"设备型号", model:"model", value: ''},
                { id:3, label:"版本号", model:"latest_ver", value: ''},
                { id:4, label:"下载地址", model:"firmware_url", value: ''},
                { id:5, label:"终端ID", model:"terminal_id", value: ''}
            ],
            select_items: []
        }
    },
    created() {
       this.fetchData()
    },
    methods: {
        fetchData() {
            let params = {
                size: this.pageSize,
                page: this.page - 1, // 第一页 page = 0
                mobile: this.searchParams.phone,
                userid: this.searchParams.mchnt_id,
                serial_number: this.searchParams.speaker_id,
                manufacturer: this.searchParams.mchnt
            }
            this.$http({
                url: '../mock/upgrade.json',
                method: 'GET',
                params
            }).then(res => {
                this.List = res.list 
                this.total = res.total
            })
        },
        reset() {
            this.$refs.searchForm.reset()
        },
        envir_bind(){
            this.isShowDialog_new = true
        },
        envir_edit() {
            this.isShowDialog_new = true
            let item = { id:1, label:"指定厂商", model: 'manufacturer', value: '', selected: [
                { name: "唱单宝", value: 0 },
                { name: "证通电子云喇叭", value: 1 }
            ]}
            this.select_items.push(item)
        },
        cancel() {

        },
        submit() {

        }
    }
}
</script>
<style lang="scss">
#upgrade {

}
</style>
