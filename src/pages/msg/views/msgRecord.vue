<template>
    <div id="msgRecord">
        <v-form ref="searchForm" class="search-form">
            <v-text-field label="手机号" hide-details v-model="searchParams.phone"/>
            <v-text-field label="类型" hide-details v-model="searchParams.sms_type"/>
            <el-date-picker
                v-model="searchParams.month"
                type="date"
                placeholder="请输入月份"
                value-format="yyyy-MM">
            </el-date-picker>
            <div style="text-align:right">
                <v-btn @click="fetchData()" color="primary">查找</v-btn>
                <v-btn @click="reset()">重置</v-btn>
                <v-btn @click="addRecord()" color="primary">新增</v-btn>
            </div>
        </v-form>
        <tableData :headers="headers" :keys="keys" :datas="List" :total="total" @fetchData="fetchData()"></tableData>
        <v-dialog
            v-model="isShowDialog"
            width="40%"
            transition="dialog-bottom-transition"
            >
            <v-card>
                <v-card-title style="background:#00b3e3 !important;color: #fff">
                    <span class="headline">发送短信</span>
                </v-card-title>
                <v-form ref="baseForm" lazy-validation class="dialog-form">
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12 sm6 md12>
                                <v-autocomplete
                                    label="选择通道" hide-details
                                    v-model="form_record.channel"
                                    :hint="`${select.value}, ${select.name}`"
                                    :items="channel_select"
                                    item-text="name"
                                    item-value="value"
                                >
                                </v-autocomplete>
                            </v-flex>
                             <v-flex xs12 sm6 md12>
                                <v-textarea solo name="input" label="请输入发送对象" :value="form_record.objects"></v-textarea>
                            </v-flex>
                             <v-flex xs12 sm6 md12>
                                <v-textarea solo name="input" label="请输入发送内容" :value="form_record.content"></v-textarea>
                            </v-flex>
                             <v-flex xs4 sm6>
                                 <span>请选择发送的类型</span>
                                <v-checkbox v-model="form_record.type" label="手机号" value="phone"></v-checkbox>
                            </v-flex>
                            <v-flex xs4 sm6>
                                <v-checkbox v-model="form_record.type" label="用户ID" value="ID"></v-checkbox>
                            </v-flex>
                            <v-flex xs4 sm6 md5>
                                <span>请选择是否定时发送及发送时间</span>
                                <v-checkbox v-model="form_record.type" label="定时发送" value="2"></v-checkbox>
                                <el-date-picker
                                    v-model="form_record.month"
                                    type="date"
                                    placeholder="请输入月份"
                                    value-format="yyyy-MM-dd">
                                </el-date-picker>
                            </v-flex>
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
    </div>
</template>
<script>
import Axios from 'axios';
import Table from '../../common/table.vue'
export default {
    components: {
      tableData: Table
    },
    data() {
        return {
            select: {value: '', name: ''},
            searchParams: {
                phone: '',
                sms_type: '',
                month: ''
            },
            headers: [
                { text: 'ID', value:'id', align: 'center', sortable: false },
                { text: '手机号', value:'phone', align: 'center', sortable: false },
                { text: '内容', value:'content', align: 'center', sortable: false },
                { text: '时间', value:'add_time', align: 'center', sortable: false },
                { text: '短信通道', value:'channel', align: 'center', sortable: false },
                { text: '短信类别', value:'sms_type', align: 'center', sortable: false }
            ],
            keys: [ 'id', 'phone', 'content', 'add_time', 'channel', 'sms_type'],
            List: [],
            notermdatatext: '正在加载',
            pageSize: '',
            page: '',
            total: '',
            selectItems: [{
                value: 10,
                text: '10条/页'
            }, {
                value: 20,
                text: '20条/页'
            }, {
                value: 50,
                text: '50条/页'
            }],
            isShowDialog: false,
            channel_select: [
                { name: '大汉短信云', value: 0},
                { name: '华森', value: 1},
                { name: '创美', value: 2}
            ],
            form_record: {
                channel: '',
                type: [],
                objects: '',
                content: '',
                month: ''
            }
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
                phone: this.searchParams.phone,
                sms_type: this.searchParams.sms_type,
                month: this.searchParams.month
            }
            this.$http({
                url: '../mock/recordList.json',
                method: 'GET',
                params
            }).then(res => {
                console.log(res)
                this.List = res.data
                this.total = res.total
            })
        },
        cancel() {
            this.isShowDialog = false
            this.$refs.baseForm.reset()
        },
        submit() {

        },
        reset() {
            this.$refs.searchForm.reset()
        },
        addRecord() {
            this.isShowDialog = true
        }
    }
}
</script>
<style>
#msgRecord {
    margin-top:10px;
}
</style>
