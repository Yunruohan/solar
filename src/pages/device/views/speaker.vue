<template>
    <div id="speaker">
        <v-form ref="searchForm" class="search-form">
            <v-text-field label="商户手机号" hide-details v-model="searchParams.phone"/>
            <v-text-field label="喇叭编号" hide-details v-model="searchParams.speaker_id"/>
            <v-text-field label="商户编号" hide-details v-model="searchParams.mchnt_id"/>
            <v-autocomplete
                label="厂商" hide-details
                v-model="searchParams.mchnt"
                clearable
                :hint="`${select.value}, ${select.name}`"
                :items="mchnt_select"
                item-text="name"
                item-value="value"
            ></v-autocomplete>
            <div style="text-align:right">
                <v-btn @click="fetchData()" color="primary">查找</v-btn>
                <v-btn @click="reset()">重置</v-btn>
                <v-btn @click="speaker_bind()" color="primary">喇叭绑定</v-btn>
                
                <v-btn @click="speaker_bind_cancel()" color="primary">喇叭解绑</v-btn>
                <v-btn @click="addRecord()" color="primary">下载当前数据表</v-btn>
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
    name: 'speaker',
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
                { text: '商户编号', value:'id', align: 'center', sortable: false },
                { text: '商户名称', value:'shopname', align: 'center', sortable: false },
                { text: '商户手机号码', value:'mobile', align: 'center', sortable: false },
                { text: '喇叭编号', value:'serial_number', align: 'center', sortable: false },
                { text: '收银员', value:'op_uid', align: 'center', sortable: false },
                { text: '绑定时间', value:'ctime', align: 'center', sortable: false },
                { text: '厂商', value:'manufacturer', align: 'center', sortable: false }
            ],
            keys: [ 'id', 'shopname', 'mobile', 'serial_number', 'op_uid', 'ctime', 'manufacturer'],
            List: [], 
            total: 0,
            isShowDialog_new: false,
            submit_type: 1, // 1表示喇叭绑定 2表示喇叭解绑
            textarea_item: [
                { id:1, label:"喇叭编号", model:"serial_number", value: ''},
                { id:2, label:"商户编号", model:"userid", value: ''},
                { id:3, label:"收银员", model:"op_uid", value: ''}
            ],
            select_items: [
                { id:1, label:"指定厂商", model: 'manufacturer', value: '', selected: [
                    { name: "唱单宝", value: 0 },
                    { name: "证通电子云喇叭", value: 1 }
                ]}
            ]
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
                url: '../mock/speaker.json',
                method: 'GET',
                params
            }).then(res => {
                console.log(res)
                this.List = res.list 
                this.total = res.total
            })
        },
        reset() {
            this.$refs.searchForm.reset()
        },
        speaker_bind() {
            this.submit_type = 1
            this.isShowDialog_new = true
        },
        speaker_bind_cancel() {
            this.submit_type = 2
            this.isShowDialog_new = true
        },
        cancel() {
            this.isShowDialog_new = false
           
        },
        submit() {
            if(this.submit_type === 1) {
                
            }else if(this.submit_type === 2) {

            }
        }
    }
}
</script>
<style lang="scss">
#speaker {

}
</style>
