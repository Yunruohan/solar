<template>
    <div id="msg">
        <!-- <table :headers="headers" :keys="keys" :datas="List" :nodatatext="notermdatatext"></table> -->
        <v-form class="search-form" ref="search_form"> 
            <v-text-field label="模版名称" v-model="form_search.name"></v-text-field>
            <v-autocomplete
                label="通道" hide-details
                v-model="form_search.state"
                clearable
                :hint="`${select.value}, ${select.name}`"
                :items="status_select"
                item-text="value"
                item-value="name"
            ></v-autocomplete>
            <v-btn color="primary" @click="fetchData()">查询</v-btn>
            <v-btn @click="reset_search_form()">重置</v-btn>
            <v-btn color="primary" @click="isShowDialog = true">新增</v-btn>
        </v-form>
        <v-data-table
            :headers="headers"
            :items="List"
            hide-actions
            class="elevation-1"
            :no-data-text="notermdatatext"
            >
            <template slot="items" slot-scope="props">
                <td class="text-xs-center" v-for="(k, index) in keys" :key="index">
                    <div  v-if="(['type', 'state'].indexOf(k) === -1)">{{ props.item[k] }}</div>
                    <div  v-else-if="(['state'].indexOf(k) > -1)">{{ state_label[props.item[k]] }}</div>
                    <div  v-else-if="(['type'].indexOf(k) > -1)">{{ type_label[props.item[k]] }}</div>
                </td>
                <td class="text-xs-center"> 
                    <v-btn @click="template_edit(props.item)">编辑</v-btn>
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
        <child ref="child" v-if="isShowDialog" :textarea_item="textarea_item" :select_items="select_items" @cancelFun="cancel()" @submitFun="submit()"></child>
    </div>
</template>
<script>
import Axios from 'axios';
import Dialog from '../../common/dialog.vue'
export default {
    components: {
        child: Dialog
    },
    data() {
        return {
            form_search: {
                name: '',
                state: ''
            },
            select: { name: '', value: '' },
            status_select: [
                { name: "全部", value: 3 },
                { name: "新建", value: 0 },
                { name: "有效", value: 1 },
                { name: "无效", value: 2 },
            ],
            types_select: [
                { name: "人工创建", value: 3 },
                { name: "客服专用", value: 2 },
                { name: "系统内置", value: 1 }
            ],
            state_label: {
                0:"新建",
                1:"有效",
                2:"无效",
                3:"全部"
            },
            type_label: {
                0:"人工创建",
                1:"系统内置",
                2:"客服专用"
            },
            headers: [
                { text: 'ID', value:'id', align: 'center', sortable: false },
                { text: '模版名称', value:'name', align: 'center', sortable: false },
                { text: '模版内容', value:'content', align: 'center', sortable: false },
                { text: '类型', value:'type', align: 'center', sortable: false },
                { text: '状态', value:'state', align: 'center', sortable: false },
                { text: '操作', value:'if_spam', align: 'center', sortable: false }
            ],
            keys: [ 'id', 'name', 'content', 'type', 'state'],
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
            textarea_item: [
                { id:1, label:"模版名称", model:"serial_number", value: ''},
                { id:2, label:"模版内容", model:"userid", value: ''}
            ],
            select_items: [
                { id:1, label:"状态", model: 'manufacturer', value: '', selected: [
                    { name: "全部", value: 3 },
                    { name: "新建", value: 0 },
                    { name: "有效", value: 1 }
                ]},
                { id:2, label:"类型", model: 'manufacturer', value: '', selected: [
                    { name: "人工创建", value: 3 },
                    { name: "客服专用", value: 2 },
                    { name: "系统内置", value: 1 }
                ]}
            ],
            form_template: {
                name: '',
                content: '',
                type: '',
                state: ''
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
                name: this.form_search.name,
                state: this.form_search.state
            }
            this.$http({
                url: '../mock/templateList.json',
                method: 'GET',
                params
            }).then(res => {
                console.log(res)
                this.List = res.data
                this.total = res.total
            })
        },
        reset_search_form() {
            this.$refs.search_form.reset()
        },
        submit() {
            this.$refs.dialog_form.reset()
        },
        template_edit(item) {
            this.isShowDialog = true
            this.form_template = Object.assign(this.form_template, item)
        },
        cancel() {
            this.isShowDialog = false
            this.$refs.dialog_form.reset()
        }
    }
}
</script>
<style lang="scss">
#msg {
    margin-top:10px;
    .search-form, .dialog-form {
        margin-top: 20px;
        padding: 12px 20px;
        background-color: #fff;
        .v-text-field {
            width: 240px;
            margin-right: 40px;
            margin-bottom: 15px;
            display: inline-block;
            vertical-align: top;
        }
    }
}
</style>
