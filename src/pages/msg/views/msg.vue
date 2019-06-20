<template>
    <div id="msg">
        <!-- <tableData :headers="headers" :keys="keys" :datas="List" :total="total"></tableData> -->
        <v-data-table
            :headers="headers"
            :items="List"
            hide-actions
            class="elevation-1"
            :no-data-text="notermdatatext"
            >
            <template slot="items" slot-scope="props">
                <td class="text-xs-center" v-for="(k, index) in keys" :key="index">
                    <div>{{ props.item[k] }}</div>
                </td>
                <td class="text-xs-center" @click="msgShowDetail(props.item.title, props.item.link, props.item.content)">详情</td>
                <td>
                    <v-btn @click="msgPush()">推送</v-btn>
                    <v-btn @click="msgShowEdit()">编辑</v-btn>
                </td>
            </template>
        </v-data-table>
        <div class="pagination-container">
            <span class="pagination-total">共 {{total}} 条</span>
            <v-select
                v-model="pageSize"
                :items="selectItems"
                @change="fetchData()"
                height="20"
                label="10页/条"
                solo
            ></v-select>
            <v-pagination
                v-model="page"
                @input="fetchData()"
                :length="parseInt(total / pageSize) + 1"
                :total-visible="7"
            ></v-pagination>
        </div>
        <v-dialog
            v-model="isShowDialog"
            width="50%"
            transition="dialog-bottom-transition"
            >
            <v-card>
                <v-card-title style="background:#00b3e3 !important;color: #fff">
                    <span class="headline">消息内容</span>
                </v-card-title>
                <v-card-text>
                    <div>
                        <span class="dialog_span">消息标题: {{ msgDetail.title }}</span>
                        <span class="dialog_span">消息链接: {{ msgDetail.link }}</span>
                        <span class="dialog_span">消息内容: {{ msgDetail.content }}</span>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" flat @click="isShowDialog = false">关闭</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="isShowDialog1"
            width="50%"
            transition="dialog-bottom-transition"
            >
            <v-card>
                <v-card-title style="background:#00b3e3 !important;color: #fff">
                    <span class="headline">确定要推送吗？</span>
                </v-card-title>
                <v-card-text>
                    <span>推送后如果要停止需要找后台！</span>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" flat @click="isShowDialog1 = false">取消推送</v-btn>
                    <v-btn color="primary" @click="submit()">确认推送</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="isShowDialog2"
            fullscreen
            hide-overlay
            transition="dialog-bottom-transition">
            <v-toolbar card dark color="primary">
                <v-toolbar-title>分配角色</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon dark @click.native="isShowDialog2 = false">
                    <v-icon>close</v-icon>
                </v-btn>
            </v-toolbar>
            <v-form ref="baseForm" lazy-validation>
                <v-container grid-list-md>
                    <v-layout wrap>
                        <v-flex xs12 sm6 md5>
                            <v-text-field label="消息标题"/>
                        </v-flex>
                        <v-flex xs12 sm6 md5>
                            <v-text-field label="消息内容"/>
                        </v-flex>
                        <v-flex xs12 sm4 md5>
                            <!-- <v-autocomplete
                                label="产品类型" hide-details
                                :hint="`${select.value}, ${select.name}`"
                                :items="productType"
                                item-text="value"
                                item-value="name"
                            >
                            </v-autocomplete> -->
                        </v-flex>
                        <v-flex xs12 sm6 md5>
                            <!-- <v-autocomplete
                                label="推送对象" hide-details
                                v-model="baseFormData.belong"
                                :hint="`${select.value}, ${select.name}`"
                                :items="belongArray"
                                item-text="value"
                                item-value="name"
                            >
                            </v-autocomplete> -->
                        </v-flex>
                        <v-flex xs12 sm6 md5>
                            <v-text-field label="推送至"/>
                        </v-flex>
                        <v-flex xs12 sm6 md5>
                            <!-- <v-autocomplete
                                label="推送条件" hide-details
                                v-model="baseFormData.confmodel"
                                @change="sessShowControl"
                                :hint="`${select.value}, ${select.name}`"
                                :items="confmodelArray"
                                item-text="value"
                                item-value="name"
                                :rules="formRules.emptyRules"
                            >
                            </v-autocomplete> -->
                        </v-flex>
                        <v-flex xs12 sm6 md5>
                            <v-text-field label="跳转链接"/>
                        </v-flex>
                        <v-flex xs12 sm6 md5>
                            <v-text-field label="小标题名称"/>
                        </v-flex>
                        <v-flex xs12 sm6 md5>
                            <!-- <v-autocomplete
                                label="推送平台" hide-details
                                v-model="baseFormData.confmodel"
                                @change="sessShowControl"
                                :hint="`${select.value}, ${select.name}`"
                                :items="confmodelArray"
                                item-text="value"
                                item-value="name"
                                :rules="formRules.emptyRules"
                            >
                            </v-autocomplete> -->
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-form>
            <footer class="px-3 pb-3 text-xs-center">
                <v-btn @click="changeDetails()">重置</v-btn>
                <v-btn @click="saveRoles()" color="primary">保存</v-btn>
            </footer>
        </v-dialog>
    </div>
</template>
<script>
import Table from '../../common/table.vue'
import Axios from 'axios';
export default {
    components: {
      tableData: Table
    },
    data() {
        return {
            headers: [
                { text: '标题', value:'title', align: 'center', sortable: false },
                { text: '推送结果', value:'result', align: 'center', sortable: false, width: '100' },
                { text: '推送状态', value:'status_str', align: 'center', sortable: false, width: '100' },
                { text: '产品类型', value:'product_str', align: 'center', sortable: false, width: '100' },
                { text: '推送方式', value:'mode_str', align: 'center', sortable: false, width: '100' },
                { text: '推送至', value:'target_str', align: 'center', sortable: false, width: '100' },
                { text: '推送平台', value:'platform_str', align: 'center', sortable: false, width: '100' },
                { text: '创建时间', value:'ctime', align: 'center', sortable: true, width: '100' },
                { text: '推送时间', value:'stime', align: 'center', sortable: true, width: '100' },
                { text: '消息详情', value:'', align: 'center', sortable: false, width: '100' },
                { text: '操作', value:'', align: 'center', sortable: false, width: '100' }
            ],
            keys: [ 'title', 'result', 'status_str', 'product_str', "target_str", 'mode_str', 'platform_str', 'ctime', 'stime'],
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
            msgDetail: {
                title: '',
                link: '',
                content: ''
            },
            isShowDialog: false,
            isShowDialog1: false,
            isShowDialog2: false,
            msgEdit: {
                
            },
            select: { name: '', value: '' },
            productType: [
                { value: "1", name:'钱卡' },
                { value: "2", name:'好近客户端' }
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
                page: this.page - 1 // 第一页 page = 0
            }
            this.$http({
                url: '../mock/tableMsg.json',
                method: 'GET',
                params
            }).then(res => {
                console.log(res)
                this.List = res.datas
                this.total = res.total
            })
        },
        msgShowDetail(title, link, content) {
            this.isShowDialog = true
            this.msgDetail.title = title
            this.msgDetail.link = link
            this.msgDetail.content = content
        },
        msgPush() {
            this.isShowDialog1 = true
        },
        msgShowEdit() {
            this.isShowDialog2 = true 
        }
    }
}
</script>
<style lang="scss">
#msg {
    margin-top:10px;
    
}
.dialog_span {
    display: block;
    font-size: 20px;
}
</style>
