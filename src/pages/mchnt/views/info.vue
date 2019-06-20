<template>
  <div class="mchntinfo">
    <v-card flat class="mt-2">
      <v-layout justify-space-between class="p-b-8">
        <v-form ref="searchForm" class="f-wrap">
          <v-text-field v-model="searchForm.userid" label="商户ID" class="t-f"></v-text-field>
          <v-text-field v-model="searchForm.name" label="签约实体" class="t-f"></v-text-field>
          <v-text-field v-model="searchForm.groupname" label="渠道名称" class="t-f"></v-text-field>
          <v-text-field v-model="searchForm.nickname" label="收据名称" class="t-f"></v-text-field>
          <v-text-field v-model="searchForm.mobile" label="手机号" class="t-f"></v-text-field>
          <v-select v-model="searchForm.cate_code" :items="TAGS" item-text="cate_name" item-value="cate_code" no-data-text="暂无数据" placeholder="请选择标签" label="商户标签" clearable class="t-f"></v-select>
          <el-date-picker
            v-model="searchForm.jointime"
            type="daterange"
            start-placeholder="入网起"
            end-placeholder="入网止"
            value-format="yyyy-MM-dd HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']">
          </el-date-picker>
          <v-btn @click="queryList" color="primary" :loading="queryLoading">查询</v-btn>
          <v-btn @click="exportMchnt" color="primary" :disabled="ex_disable">导出</v-btn>
        </v-form>
      </v-layout>
      <v-data-table :headers="headers" :items="list" hide-actions class="elevation-1" :loading="loading" :no-data-text="noinfodatatext" item-key="userid">
        <template slot="items" slot-scope="props">
          <td class="text-xs-center">{{ props.item.userid }}</td>
          <td class="text-xs-center">{{ props.item.name }}</td>
          <td class="text-xs-center">{{ props.item.nickname }}</td>
          <td class="text-xs-center">{{ props.item.groupname }}</td>
          <td class="text-xs-center">{{ props.item.mobile }}</td>
          <td class="text-xs-center">{{ props.item.auditstatename }}</td>
          <td class="text-xs-center">{{ props.item.jointime }}</td>
          <td class="justify-center layout align-center">
            <v-btn color="primary" @click="viewMore(props.item.userid)">详情</v-btn>
            <!-- <v-btn color="primary" @click="viewSubDiv(props.item.userid)">分账</v-btn> -->
            <v-btn color="primary" @click="operMore(props.item.userid)">更多</v-btn>
          </td>
        </template>
      </v-data-table>
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageCount"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalItems">
        </el-pagination>
      </div>
    </v-card>
    <!-- 详情弹框 -->
    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
			<!-- 详情loading -->
			<v-dialog fullscreen v-model="mchntDetailLoading">
				<div class="loading-bro">
					<svg id="load" x="0px" y="0px" viewBox="0 0 150 150">
						<circle id="loading-inner" cx="75" cy="75" r="60"/>
					</svg>
				</div>
			</v-dialog>
      <div class="d-v">
        <div class="d-h">
          <div class="d-h-f">
            <div :class="['d-h-i', tabidx===index ? 'd-h-i-active' : '']" v-for="(item, index) in tabs" :key="index" @click="tabchange(index)">{{item}}</div>
          </div>
          <div class="d-h-e">
            <div class="d-h-i" @click="closedia">关闭</div>
          </div>
        </div>
        <div v-if="tabidx===0">
          <!-- 商户详情 -->
          <div class="d-i-w">
            <div class="b-i-w">
              <div class="b-i-h">
                <div>基本信息</div>
                <v-btn color="primary" small @click="editbasicinfo">修改</v-btn>
              </div>
              <infotemp :keys="basicinfokeys" :dict="basicinfodict" :infos="basicinfo"/>
            </div>
            <!-- 店铺信息 -->
            <div class="b-i-w">
              <div class="b-i-h">
                <div>店铺信息</div>
                <v-btn color="primary" small @click="editshopinfo">修改</v-btn>
              </div>
              <infotemp :keys="shopinfokeys" :dict="shopinfodict" :infos="shopinfo" :mccObj="mccObj"/>
            </div>
            <!-- 合同信息 -->
            <div class="b-i-w">
              <div class="b-i-h">
                <div>合同信息</div>
                <div v-if="!editPos">
                  <v-btn color="primary" small @click="editposinfo">修改</v-btn>
                </div>
                <div v-else>
                  <v-btn color="primary" small @click="posSubmit">提交</v-btn>
                  <v-btn color="primary" small @click="posCancel">取消</v-btn>
                </div>
              </div>
              <cotable :headers="posheaders" :datas="[posdata]" :nodatatext="noposdatatext" :keys="poskeys" :edit="editPos"></cotable>
            </div>
            <!-- 产品信息 -->
            <div class="b-i-w">
              <div class="b-i-h">
                <div>产品信息</div>
                <div v-if="!editPro">
                  <v-btn color="primary" small @click="editproinfo">修改</v-btn>
                </div>
                <div v-else>
                  <v-btn color="primary" small @click="proSubmit">提交</v-btn>
                  <v-btn color="primary" small @click="proCancel">取消</v-btn>
                </div>
              </div>
              <cotable :headers="productheaders" :datas="productdata" :nodatatext="nodatatext" :keys="productkeys" :edit="editPro"></cotable>
            </div>
            <!-- 结算信息 -->
            <div class="b-i-w">
              <div class="b-i-h">结算信息</div>
              <infotemp :keys="bankinfokeys" :dict="bankinfodict" :infos="bankinfo"/>
            </div>
            <!-- 终端信息 -->
            <div class="b-i-w">
              <div class="b-i-h">终端信息</div>
              <cotable :headers="termheaders" :datas="termdata" :nodatatext="notermdatatext" :keys="termkeys"></cotable>
            </div>
            <!-- 凭证信息 -->
            <div class="b-i-w">
              <div class="b-i-h">
                <div>凭证信息</div>
                <v-btn @click="addImg" color="primary" :loading="addImgLoading">新增凭证</v-btn>
              </div>
              <div v-if="vouchers.length" class="b-i-d-w">
                <div v-for="item in vouchers" :key="item.id" class="b-i-img">
                  <div class="img-w">
                    <v-img :lazy-src="item.imgurl" :alt="item.cn_name" aspect-ratio="1" @click="showImg(item.imgurl)"></v-img>
                    <v-btn @click="editImg(item)" color="primary">修改</v-btn>
                  </div>
                  <div class="cn_name">{{item.cn_name}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="tabidx===1">
          <div class="b-i-w">
            <cotable :headers="oplogheaders" :datas="oplogs" :nodatatext="nooplogtext" :keys="oplogkeys"></cotable>
          </div>
        </div>
        <div v-if="tabidx===2">
          <div class="b-i-w">
            <cotable :headers="sslogheaders" :datas="sslogs" :nodatatext="nosslogtext" :keys="sslogkeys"></cotable>
          </div>
        </div>
      </div>
    </v-dialog>
    <!-- 分账弹框 -->
    <v-dialog v-model="divDia" fullscreen hide-overlay transition="dialog-bottom-transition">
      <div class="d-v">
        <div>
          <v-btn @click="addDiv" color="primary">添加分账模版</v-btn>
          <v-btn @click="cancelDivDia">取消</v-btn>
        </div>
        <!-- 添加模版 -->
        <v-form v-model="valid" ref="addform" v-if="adding">
          <div>
            <v-layout justify-space-between class="acc-h">
              <div class="acc-i-t">模版ID:</div>
              <div>
                <v-btn @click="addMchnt" color="primary">添加分账人</v-btn>
                <v-btn @click="submit" color="primary">提交</v-btn>
                <v-btn @click="cancelAddAlert">取消</v-btn>
              </div>
            </v-layout>
            <div class="flex-tb">
              <div v-for="(_item, _index) in divheaders" :key="_index" :class="'c'+_index">{{_item.text}}</div>
            </div>
            <div v-for="(item, index) in ruledetailList" :key="index">
              <div class="flex-tb">
                <div class="c0">{{index + 1}}</div>
                <div class="c1">
                  <div v-if="index===0">{{item.userid}}</div>
                  <v-text-field v-else v-model="item.userid" :rules="useridRule" @blur="appendmchntinfo(item)"></v-text-field>
                </div>
                <div class="c2">
                  <v-select :items="item['details']['mchnts']" v-model="item.mchntid" v-if="item['details']" :rules="mchntidRule"></v-select>
                  <v-select v-else :rules="mchntidRule"></v-select>
                </div>
                <div class="d-flex c3"><v-text-field v-model="item.percent" :rules="perRule"></v-text-field>%</div>
                <div color="primary" @click="expandDetail(item)" class="c4">
                  <div v-if="item.expand">
                    <span>关闭</span>
                    <v-icon>expand_less</v-icon>
                  </div>
                  <div v-else>
                    <span>查看</span>
                    <v-icon>expand_more</v-icon>
                  </div>
                </div>
                <div class="c5">
                  <v-switch v-model="item.feem" class="justify-center" @change="feeSwitch(item)" :disabled="switchdisable && !item.feem"></v-switch>
                  <v-icon v-if="item.cancelable" @click="deleRule(index)">delete</v-icon>
                </div>
              </div>
              <div class="below-row" v-if="item.expand && item.details">
                <div v-for="(_item, _index) in mchntdetailkeys" :key="_index">
                  {{mchntdetaildict[_item]}}: {{item['details']['infos'][_item]}}
                </div>
              </div>
            </div>
          </div>
        </v-form>
        <!-- 模版展示 -->
        <div v-if="divList.length">
          <div class="temp-wrap" v-for="(item, index) in divList" :key="item.template_id">
            <!-- 编辑模版 -->
            <v-form v-model="valid" ref="addform" v-if="editing && editTempId === item.template_id">
              <div>
                <v-layout justify-space-between class="acc-h">
                  <div class="acc-i-t">
                    <div><span>模版ID: {{item.template_id}}</span><span>（{{item.state}}<span v-if="item.errmsg">{{item.errmsg}}</span>）</span></div>
                    <div class="apply-no-box">批次：{{item.applyNo}}</div>
                  </div>
                  <div>
                    <v-btn @click="addMchntForEdit(index)" color="primary">添加分账人</v-btn>
                    <v-btn @click="submitEdit(item)" color="primary">提交</v-btn>
                    <v-btn @click="cancelEditAlert">取消</v-btn>
                  </div>
                </v-layout>
                <div class="flex-tb">
                  <div v-for="(_item, _index) in divheaders" :key="_index" :class="'c'+_index">{{_item.text}}</div>
                </div>
                <div v-for="(_item, _index) in item.detail" :key="_index">
                  <div class="flex-tb">
                    <div class="c0">{{_index + 1}}</div>
                    <div class="c1">
                      <div v-if="_index===0">{{_item.userid}}</div>
                      <v-text-field v-else v-model="_item.userid" :rules="useridRule" @blur="appendmchntinfo(_item)"></v-text-field>
                    </div>
                    <div class="c2">
                      <v-select :items="_item['details']['mchnts']" v-model="_item.mchntid" v-if="_item['details']" :rules="mchntidRule" :disabled="_index===0"></v-select>
                      <v-select v-else :rules="mchntidRule"></v-select>
                    </div>
                    <div class="d-flex c3"><v-text-field v-model="_item.percent" :rules="perRule"></v-text-field>%</div>
                    <div color="primary" @click="expandDetail(_item)" class="c4">
                      <div v-if="_item.expand">
                        <span>关闭</span>
                        <v-icon>expand_less</v-icon>
                      </div>
                      <div v-else>
                        <span>查看</span>
                        <v-icon>expand_more</v-icon>
                      </div>
                    </div>
                    <div class="c5">
                      <v-switch v-model="_item.feem" class="justify-center" @change="feeSwitch(_item)" :disabled="switchdisable && !_item.feem"></v-switch>
                      <v-icon v-if="_item.cancelable" @click="deleRuleForEdit(index, _index)">delete</v-icon>
                    </div>
                  </div>
                  <div class="below-row" v-if="_item.expand && _item.details">
                    <div v-for="(__item, __index) in mchntdetailkeys" :key="__index">
                      {{mchntdetaildict[__item]}}: {{_item['details']['infos'][__item]}}
                    </div>
                  </div>
                </div>
              </div>
            </v-form>
            <!-- 非编辑模版展示 -->
            <v-card v-else>
              <v-layout justify-space-between class="acc-h">
                <div class="acc-i-t">
                  <div><span>模版ID: {{item.template_id}}</span><span>（{{item.state}}）</span></div>
                  <div class="apply-no-box">批次：{{item.applyNo}}</div>
                </div>
                <div>
                  <v-btn @click="editDivMchnt(item)" color="primary">编辑</v-btn>
                </div>
              </v-layout>
              <div class="flex-tb">
                <div v-for="(_item, _index) in divheaders" :key="_index" :class="'c'+_index">{{_item.text}}</div>
              </div>
              <div v-for="(_item, _index) in item.detail" :key="_index">
                <div class="flex-tb">
                  <div class="c0">{{_index+1}}</div>
                  <div class="c1">{{_item.userid}}</div>
                  <div class="c2">{{_item.mchntid}}</div>
                  <div class="c3">{{_item.percent}}</div>
                  <div @click="expandDetailWithList(_item)" class="c4">
                    <div v-if="_item.expand">
                      <span>关闭</span>
                      <v-icon>expand_less</v-icon>
                    </div>
                    <div v-else>
                      <span>查看</span>
                      <v-icon>expand_more</v-icon>
                    </div>
                  </div>
                  <div class="c5">
                    <v-switch v-model="_item.feem" class="justify-center"></v-switch>
                  </div>
                </div>
                <div class="below-row" v-if="_item.expand && _item.details">
                  <div v-for="(__item, __index) in mchntdetailkeys" :key="__index">
                    {{mchntdetaildict[__item]}}: {{_item.details.infos[__item]}}
                  </div>
                </div>
              </div>
            </v-card>
          </div>
        </div>
      </div>
    </v-dialog>
    <!-- excel -->
    <!-- <image :src="src" frameborder="0" style="display: none;"></image> -->
    <!-- 放大图片 -->
    <v-dialog
      v-model="imgShow" attach=".mchntinfo"
    >
      <v-card class="pa-0 tx-center" d-flex>
        <img :src="imgSrc" alt="" style="max-width: 100%;">
      </v-card>
    </v-dialog>
    <!-- 基本信息修改 -->
    <v-dialog v-model="editBaseDia" class="dia-modal" persistent>
      <v-card class="f-card">
      <form-temp :formData="fData" :formKeys="fKeys" :formDict="fDict" :formRule="fRule" @confirm="basicInfoEditSubmit" @cancel="basicInfoEditCancel" :userStates="USER_STATE" :userTypes="USER_TYPE"></form-temp>
      </v-card>
    </v-dialog>
    <!-- 店铺信息修改 -->
    <v-dialog v-model="editShopDia" class="dia-modal" persistent>
      <v-card class="f-card">
      <form-temp :formData="fData" :formKeys="fKeys" :formDict="fDict" :formRule="fRule" @confirm="shopInfoEditSubmit" @cancel="shopInfoEditCancel" @getSales="getSales" :salesList="salesList" :mccList="mccList"></form-temp>
      </v-card>
    </v-dialog>
    <!-- 关闭分账模版弹框确认 -->
    <confirm-temp :msg="divDiaMsg" :dia="divDiaState" @confirmFun="closeDivDiaFun" @cancelFun="divDiaState = false"></confirm-temp>
    <!-- 取消添加分账模版确认 -->
    <confirm-temp :msg="addDiaMsg" :dia="addDiaState" @confirmFun="closeAddDiaFun" @cancelFun="addDiaState = false"></confirm-temp>
    <!-- 取消编辑分账模版确认 -->
    <confirm-temp :msg="editDiaMsg" :dia="editDiaState" @confirmFun="closeEditDiaFun" @cancelFun="editDiaState = false" persistent></confirm-temp>
    <!-- 凭证上传弹框 -->
    <v-dialog v-model="addImgDia" class="dia-modal" persistent>
      <v-card class="f-card">
        <v-form ref="imgForm">
          <v-select v-model="imgForm.type" :items="voucherList" item-text="name" item-value="id" no-data-text="暂无数据" placeholder="请选择凭证名" label="凭证类型" :rules="imgFormRule.type"></v-select>
          <div>
            <div id="addImage">
              <v-icon large>add</v-icon>
              <input ref="inputfile" type="file" accept="image/jpg,image/png,image/jpeg" @change="beforeUpload($event)"/>
            </div>
            <span>请选择图片</span>
          </div>
          <div>
            <div class="img-w-inline" v-for="(item, index) in vImgs" :key="index">
              <v-img :src="item" aspect-ratio="1"></v-img>
              <v-icon class="dele-img" large @click="deleImg">delete</v-icon>
            </div>
          </div>
          <v-btn @click="uploadImg" color="primary" :loading="upLoading">上传</v-btn>
          <v-btn @click="cancelUpload" color="primary">取消</v-btn>
        </v-form>
      </v-card>
    </v-dialog>
    <!-- 更多操作弹框 -->
    <v-dialog v-model="operMoreDia" class="dia-modal">
      <v-card class="o-card">
        <v-btn color="primary" @click="viewSubDiv">分账</v-btn>
        <v-btn color="primary" @click="withdrawCtrl">
          {{withdrawStatus ? '关闭钱包' : '开通钱包'}}
        </v-btn>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import Http from '@/http'
import { Cotable, Infotemp, ConfirmTemp, FormTemp } from '../common/index'
import { UploadImgToBase64 } from '../utils'
import Axios from 'axios'
export default {
  data () {
    return {
      detailLoadDia: true,
      loading: false,
      list: [],
      nodatatext: '正在加载',
      totalItems: 0,
      page: 1,
      pageCount: 10,
      headers: [
        { text: '商户ID', align: 'center', sortable: false, value: 'userid' },
        { text: '签约实体', align: 'center', sortable: false },
        { text: '收据名称', align: 'center', sortable: false },
        { text: '渠道名称', align: 'center', sortable: false },
        { text: '手机号', align: 'center', sortable: false },
        { text: '审核状态', align: 'center', sortable: false },
        { text: '入网时间', align: 'center', sortable: false },
        { text: '操作', align: 'center', sortable: false }
      ],
      noinfodatatext: '正在加载',
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
      searchForm: {
        userid: '',
        mobile: '',
        groupname: '',
        name: '',
        nickname: '',
        jointime: '',
        cate_code: ''
      },
      TAGS: [],
      USER_STATE: [],
      USER_TYPE: [],
      dialog: false,
      tabs: ['商户详情', '操作日志', '客服日志'],
      tabidx: 0,
      basicinfo: {},
      basicinfodict: {
        userid: '商户ID',
        user_type_name: '商户类型',
        name: '签约实体',
        licensenumber: '营业执照号',
        legalperson: '法人代表',
        idnumber: '身份证',
        iddate: '身份证有效期',
        auditstatename: '审核状态',
        lastaudittime: '审核时间',
        src: '注册来源',
        shop_type: '门店类型',
        is_sales: '是否业务员',
        state_name: '商户状态',
        tags: '商户标签',
        sub_mchnt: '子商户号'
      },
      basicinfokeys: [],
      divDia: false,
      divheaders: [
        { text: '序号' },
        { text: '商户ID' },
        { text: '商户号' },
        { text: '分账比例' },
        { text: '商户详情' },
        { text: '分账手续支付' }
      ],
      dealfee: '',
      expand: false,
      src: '',
      shopinfo: {},
      shopinfodict: {
        mobile: '手机号',
        telephone: '固定电话',
        email: '邮箱',
        nickname: '收据名称',
        province: '经营省份',
        city: '经营城市',
        district: '经营区县',
        address: '经营地址',
        mcc: '经营类型',
        ext_mcc: '海外MCC',
        groupid: '渠道id',
        grouptype: '渠道类型',
        groupname: '渠道名称',
        business_name: '业务员',
        business_mobile: '业务员手机',
        short_name: '商户简称',
        website: '商户网址'
      },
      shopinfokeys: [],
      productdata: [],
      productheaders: [
				{ text: '交易类型', align: 'center', sortable: false },
				{ text: '卡类型', align: 'center', sortable: false },
        { text: '费率', align: 'center', sortable: false },
        { text: '二阶费率', align: 'center', sortable: false},
        { text: '封顶', align: 'center', sortable: false }
				// { text: '风控单比限额', align: 'center', sortable: false }
      ],
      productkeys: ['trade_type', 'card_type', 'ratio', 'second_ratio', 'max_fee'],
      // productkeys: ['trade_type', 'card_type', 'ratio', 'max_fee'],
      bankinfo: {},
      bankinfodict: {
        bank_type_name: '结算类型',
        bankuser: '开户名',
        bankname: '开户总行名称',
        brchbank_code: '联行号',
        bankProvince: '银行所在省',
        bankCity: '银行所在市',
        bankmobile: '银行预留手机号',
        bankaccount: '银行卡号'
      },
      bankinfokeys: [],
      termdata: [],
      termheaders: [
        { text: '设备编号', align: 'center', sortable: false },
        { text: '激活时间', align: 'center', sortable: false },
        { text: '状态', align: 'center', sortable: false }
      ],
      notermdatatext: '正在加载',
      termkeys: ['terminalid', 'active_date', 'state'],
      vouchers: [],
      imgShow: false,
      imgSrc: '',
      oplogs: [],
      sslogs: [],
      oplogheaders: [
        { text: '操作人ID', align: 'center', sortable: false },
        { text: '业务类型', align: 'center', sortable: false },
        { text: '业务操作', align: 'center', sortable: false },
        { text: '操作时间', align: 'center', sortable: false },
        { text: '操作详情', align: 'center', sortable: false }
      ],
      nooplogtext: '正在加载',
      oplogkeys: ['admin_id', 'op_type', 'action', 'action_time', 'detail'],
      nosslogtext: '正在加载',
      sslogheaders: [
        { text: '处理者ID', align: 'center', sortable: false },
        { text: '时间', align: 'center', sortable: false },
        { text: '备注', align: 'center', sortable: false }
      ],
      sslogkeys: ['admin_id', 'action_time', 'ss_memo'],
      editBaseDia: false,
      divList: [],
      editing: false,
      adding: false,
      submitRule: {
        userid: '',
        mchntid: '',
        detail: [],
        fee_mchntid: ''
      },
      ruledetailList: [
        { userid: '', mchntid: '', percent: '', expand: false, feem: false },
        { userid: '', mchntid: '', percent: '', expand: false, feem: false }
      ],
      mchntinfostore: {},
      mchntdetaildict: {
        name: '商户姓名',
        idnumber: '身份证号',
        bankmobile: '预留手机号',
        bankaccount: '银行卡号',
        headbankname: '开户行',
        bankArea: '银行所在省/市'
      },
      mchntdetailkeys: [],
      currentIndex: '',
      switchdisable: false,
      useridRule: [v => !!v || '请填写商户ID'],
      mchntidRule: [v => !!v || '请选择商户号'],
      perRule: [
        v => !!v || '请填写分账比例',
        v => v >= 0.01 || '比例需大于0.01',
        v => /^\d{1,2}([.]{1}\d{1,2})?$/.test(v) || '请输入最多两位小数的正数'
      ],
      valid: false,
      detailinfo: [],
      feeMchntid: '',
      detailList: [],
      editTempId: '',
      divDiaState: false,
      divDiaMsg: '',
      addDiaMsg: '',
      addDiaState: false,
      editDiaMsg: '',
      editDiaState: false,
      fData: {},
      fKeys: [],
      fRule: [],
      fDict: {},
      mchntDetailLoading: false,
      editItem: '',
      editShopDia: false,
      mchntUid: '', // 商户id
      editPro: false,
      salesList: [],
      productdatacache: '',
      shopinfocache: '',
      basicinfocache: '',
      queryLoading: false,
      mccList: [],
      mccObj: {},
      fileList: [],
      addImgLoading: false,
      uploadImgLoading: false,
      ImgTypes: [],
      imgForm: {
        type: ''
      },
      imgFormRule: {
        type: [v => !!v || '请选择凭证名称']
      },
      addImgDia: false,
      voucherList: [],
      vImgs: [],
      enuserid: '',
      upLoading: false,
      iseditimg: false,
      editimgid: '',
      editimgname: '',
      editimgtag: '',
      queried: false,
      ex_disable: true,
      operMoreDia: false,
      withdrawDia: false,
      withdrawList: [],
      withdrawForm: {
        chnlid: '',
        mchntid: ''
      },
      withLoading: false,
      withdrawStatus: false,
      fixedCid: '', //目前就是1062
      posdata: [{
        "contract_no": "", //合同编号
        "contract_sdate": "",   //合同开始日期
        "contract_edate": "",   //合同结束日期
        "licensestat_date": "",   //营业执照开始日期
        "licenseend_date": "",  //营业执照结束日期
        "license_address": ""
      }],
      posheaders: [
        { text: '合同编号', align: 'center', sortable: false },
        { text: '合同开始日期', align: 'center', sortable: false },
        { text: '合同结束日期', align: 'center', sortable: false },
        { text: '营业执照开始日期', align: 'center', sortable: false },
        { text: '营业执照结束日期', align: 'center', sortable: false },
        { text: '营业执照地址', align: 'center', sortable: false }
      ],
      noposdatatext: '正在加载',
      poskeys: ['contract_no', 'contract_sdate', 'contract_edate', 'licensestat_date', 'licenseend_date', 'license_address'],
      editPos: false,
      posdatacache: ''
    }
  },
  methods: {
    deleImg () {
      this.vImgs = []
    },
    cancelUpload () {
      this.addImgDia = false
      this.deleImg()
      this.imgForm.type = ''
    },
    async beforeUpload(e) {
      // let reader = new FileReader()
      let res = await UploadImgToBase64(e.target.files[0])
      console.log('r0---', res)
      this.vImgs = []
      // this.vImgs.push(res.result)
      this.$set(this.vImgs, 0, res.result)
    },
    addImg () {
      this.iseditimg = false
      this.imgForm.type = ''
      this.addImgDia = true
    },
    editImg (item) {
      this.vImgs.push(item.imgurl)
      this.imgForm.type = item.name
      this.editimgid = item.id
      this.editimgname = item.imgname
      this.editimgtag = item.name
      this.addImgDia = true
      this.iseditimg = true
    },
    dataURLtoBlob (dataurl) {
      let arr = dataurl.split(',')
      let mime = arr[0].match(/:(.*?);/)[1]
      let bstr = atob(arr[1])
      let n = bstr.length
      let u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new Blob([u8arr], { type: mime })
    },
    uploadImg () {
      if (this.$refs.imgForm.validate()) {
        if (!this.vImgs.length) {
          this.$store.dispatch('setSnackbar', {
            showSnackbar: true,
            snackbarText: '请上传凭证图片',
            snackbarColor: 'error'
          })
          return
        }
        let hasType = false
        this.vouchers.map(item => {
          if (item.name === this.imgForm.type) {
            hasType = true
          }
        })
        if (hasType && this.imgForm.type !== this.editimgtag) {
          this.$store.dispatch('setSnackbar', {
            showSnackbar: true,
            snackbarText: '凭证类别已存在',
            snackbarColor: 'error'
          })
          return
        }
        if (this.vImgs[0].startsWith('http')) {
          this.submitUploadedImg({
            data: {
              tag: this.imgForm.type,
              name: this.editimgname,
              url: this.vImgs[0]
            }
          })
        } else {
          let form = new FormData()
          form.append('file', this.dataURLtoBlob(this.vImgs[0]))
          form.append('category', 1)
          form.append('source', 1)
          form.append('tag', this.imgForm.type)
          form.append('format', 'cors')
          form.append('enuserid', this.enuserid)
          this.upLoading = true
          const url = 'https://o.qfpay.com/util/v1/uploadfile'
          Axios({
            method: 'post',
            url: url,
            data: form,
            config: { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
          }).then((_res) => {
            this.submitUploadedImg(_res)
          })
        }
      }
    },
    async submitUploadedImg (_res) {
      let res = await Http.post(`/solar/v1/mchnt/vouchersave`, {
        userid: this.mchntUid,
        name: _res.data.tag,
        imgname: _res.data.name
      })
      this.upLoading = false
      if (res.respcd === '0000') {
        this.addImgDia = false
        this.vImgs = []
        if (!this.iseditimg) {
          let canReplace = false
          this.vouchers.map((item, index) => {
            if (item.name === _res.data.tag) {
              this.canReplace = true
              this.vouchers[index].imgurl = _res.data.url
            }
          })
          if (!canReplace) {
            this.vouchers.push({
              imgurl: _res.data.url,
              cn_name: this.voucherList.find(item => item.id === _res.data.tag)['name'],
              name: _res.data.tag
            })
          }
        } else {
          this.vouchers.map((item, index) => {
            if (item.name === this.editimgtag) {
              this.vouchers[index].name = _res.data.tag
              this.vouchers[index].imgurl = _res.data.url
              this.vouchers[index].cn_name = this.voucherList.find(item => item.id === _res.data.tag)['name']
            }
          })
        }
        this.$store.dispatch('setSnackbar', {
          showSnackbar: true,
          snackbarText: '提交成功',
          snackbarColor: 'success'
        })
      }
    },
    async proSubmit() {
      let reg0 = /^(\-)?\d+(\.\d+)?$/
      let reg = /^(\-)?\d+(\.\d{1,4})?$/
      let ok = true
      this.productdata.map(item => {
        if (!reg0.test(item.second_ratio) || !reg0.test(item.ratio) || !reg0.test(item.max_fee) || !reg.test(item.second_ratio) || !reg.test(item.ratio) || !reg.test(item.max_fee)) {
          ok = false
        }
        if (item.second_ratio !== -1 && item.second_ratio !==0 && item.second_ratio >= 1 && item.second_ratio <0) {
          ok = false
        }
        if (item.ratio !== -1 && item.ratio !==0 && item.ratio >= 1 && item.ratio <0) {
          ok = false
        }
        if (item.max_fee !== -1 && item.max_fee !==0 && item.max_fee >= 1 && item.max_fee <0) {
          ok = false
        }
        item.ratio = parseFloat(item.ratio)
        item.max_fee = parseFloat(item.max_fee)
        item.second_ratio = parseFloat(item.second_ratio)
      })
      if (!ok) return
      let submitObj = []
      let oldObj = []
      let olddata = JSON.parse(this.productdatacache)
      this.productdata.map(item => {
        let sameitem = olddata.find(_item => _item.code === item.code)
        if (item.ratio !== sameitem.ratio || item.max_fee !== sameitem.max_fee || item.second_ratio !== sameitem.second_ratio) {
          submitObj.push(item)
          oldObj.push(sameitem)
        }
      })
      console.log(submitObj.length)
      if (!submitObj.length) return
      let res = await Http.put(`/solar/v1/mchnt/editproinfo`, {
        userid: this.mchntUid,
        data: submitObj,
        oldvalue: oldObj
      })
      if (res.respcd === '0000') {
        this.editPro = false
        this.productdatacache = JSON.stringify(this.productdata)
      }
    },
    proCancel () {
      this.productdata = JSON.parse(this.productdatacache)
      this.editPro = false
    },
    editposinfo() {
      this.editPos = true
    },
    posCancel() {
      this.posdata = JSON.parse(this.posdatacache)
      this.editPos = false
    },
    async posSubmit() {
      let reg0 = /^[\u2E80-\u9FFF`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]*$/
      let reg = /^[a-zA-Z0-9]{0,40}$/
      let contractno = this.posdata.contract_no
      if (reg0.test(contractno)) return
      if (!reg.test(contractno)) return
      if (this.posdata.license_address.length > 256) return
      let submitObj = {}
      let oldObj = {}
      Object.keys(this.posdata).map(item => {
        if (this.posdata[item] !== JSON.parse(this.posdatacache)[item]) {
          submitObj[item] = this.posdata[item]
          oldObj[item] = JSON.parse(this.posdatacache)[item]
        }
      })
      if (!Object.keys(submitObj)) return
      submitObj.userid = this.mchntUid
      if (!submitObj.userid) return
      submitObj.oldvalue = JSON.stringify(oldObj)
      let res = await Http.put(`/solar/v1/mchnt/editextinfo`, submitObj)
      if (res.respcd === '0000') {
        this.editPos = false
        this.posdatacache = JSON.stringify(this.posdata)
      }
    },
    async getSales() {
      if (!this.shopinfo.groupid) return
      let res = await Http.get(`/solar/v1/mchnt/qudaosales`, {
        groupid: this.shopinfo.groupid
      })
      if (res.respcd === '0000') {
        this.salesList = [...res.data]
      }
    },
    async getOpLog() {
      let res = await Http.get(`/solar/v1/mchnt/oplog`, {
        userid: this.mchntUid
      })
      if (res.respcd === '0000') {
        this.oplogs = [...res.data]
      }
    },
    async getSsLog() {
      let res = await Http.get(`/solar/v1/mchnt/sslog`, {
        userid: this.mchntUid
      })
      if (res.respcd === '0000') {
        this.sslogs = [...res.data]
      }
    },
    feeSwitch (item) {
      this.switchdisable = item.feem
      this.feeMchntid = item.feem ? item.mchntid : ''
    },
    showImg (src) {
      this.imgSrc = src
      this.imgShow = true
    },
    tabchange(val) {
      this.tabidx = val
      if (val === 1) {
        this.getOpLog()
      }
      if (val === 2) {
        this.getSsLog()
      }
    },
    closedia() {
      this.editPro = false
      this.dialog = false
      this.oplogs = []
      this.sslogs = []
      this.editPos = false
      this.editPro = false
      this.cancelUpload()
      this.getList()
    },
    handleSizeChange(val) {
      this.pageCount = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.page = val
      this.getList()
    },
    async queryList() {
      this.queried = false
      if (Object.values(this.searchForm).join('')) {
        this.ex_disable = false
      }
      this.queryLoading = true
      this.page = 1
      await this.getList()
      this.queryLoading = false
      this.queried = true
    },
    async getList () {
      this.searchForm.cate_code = this.searchForm.cate_code ? this.searchForm.cate_code : ''
      this.loading = true
      let res = await Http.get(`/solar/v1/mchnt/info`, {
        page: this.page - 1,
        size: this.pageCount,
        groupname: this.searchForm.groupname,
        name: this.searchForm.name,
        userid: this.searchForm.userid,
        mobile: this.searchForm.mobile,
        nickname: this.searchForm.nickname,
        // jointime: this.searchForm.jointime ? this.searchForm.jointime.join(',') : '',
        jointime_stime: this.searchForm.jointime ? this.searchForm.jointime[0] : '',
        jointime_etime: this.searchForm.jointime ? this.searchForm.jointime[1] : '',
        cate_code: this.searchForm.cate_code
      })
      this.loading = false
      if (res.respcd === '0000') {
        res = res.data
        this.list = [...res.list]
        this.totalItems = res.total
      }
      if (this.list.length === 0) {
        this.noinfodatatext = '暂无数据'
      }
    },
    async getTags() {
      let res = await Http.get(`/solar/v1/mchnt/tags`)
      if (res.respcd === '0000') {
        res = res.data
        this.TAGS = [...res]
      }
    },
    async getMccs() {
      let res = await Http.get(`/solar/v1/mchnt/mcclist`)
      if (res.respcd === '0000') {
        res = res.data
        this.mccList = [...res]
        this.mccList.map(item => {
          this.mccObj[item.id] = item.mcc_name
        })
      }
    },
    async getState() {
      let res = await Http.get(`/solar/v1/mchnt/mchntstate`)
      if (res.respcd === '0000') {
        res = res.data
        Object.keys(res).map(item => {
          this.USER_STATE.push({
            id: Number(item),
            name: res[item]
          })
        })
      }
    },
    async getUserType() {
      let res = await Http.get(`/solar/v1/mchnt/mchntusertype`)
      if (res.respcd === '0000') {
        res = res.data
        Object.keys(res).map(item => {
					this.USER_TYPE.push({
						id: Number(item),
						name: res[item]
					})
				})
      }
    },
    async viewMore(uid) {
      this.dialog = true
      this.mchntDetailLoading = true
      let res = await Http.get(`/solar/v1/mchnt/detail`, {
        userid: uid
      })
      this.mchntDetailLoading = false
      if (res.respcd === '0000') {
        res = res.data
        this.basicinfo = res.basicinfo
        this.mchntUid = this.basicinfo.userid
        let iddate = [this.basicinfo.idstatdate ? this.basicinfo.idstatdate : '', this.basicinfo.idenddate ? this.basicinfo.idenddate : '']
        this.$set(this.basicinfo, 'iddate', iddate)
        Object.keys(this.basicinfo).map(item => {
          if (this.basicinfo[item] === null) {
            this.basicinfo[item] = ''
          }
        })
        this.basicinfocache = JSON.stringify(this.basicinfo)
        this.shopinfo = res.shopinfo
        this.shopinfo.mcc = this.shopinfo.mcc ? Number(this.shopinfo.mcc) : this.shopinfo.mcc
        Object.keys(this.shopinfo).map(item => {
          if (this.shopinfo[item] === null) {
            this.shopinfo[item] = ''
          }
        })
        this.shopinfocache = JSON.stringify(this.shopinfo)
        this.productdata = [...res.productinfo]
        this.productdatacache = JSON.stringify(this.productdata)
        this.bankinfo = res.bankinfo
        this.termdata = [...res.terminfo]
        this.vouchers = [...res.voucherinfo]
        this.enuserid = res.uid
        this.posdata = res.ext_info
        this.posdatacache = JSON.stringify(this.posdata)
      }
      if (!this.termdata.length) {
        this.notermdatatext = '暂无数据'
      }
      if (!this.oplogs.length) {
        this.nooplogtext = '暂无数据'
      }
      if (!this.sslogs.length) {
        this.nosslogtext = '暂无数据'
      }
      this.bankinfokeys = Object.keys(this.bankinfodict)
      this.basicinfokeys = Object.keys(this.basicinfodict)
      this.shopinfokeys = Object.keys(this.shopinfodict)
      this.bankinfokeys = Object.keys(this.bankinfodict)
    },
    async operMore (uid) {
      this.operMoreDia = true
      this.mchntUid = uid
      await this.getCidConfig()
      this.getWithdrawStatus()
    },
    async getWithdrawStatus() {
      this.withdrawStatus = false
      let res = await Http.get('/solar/v1/mchnt/withdrawstatus', {
        userid: this.mchntUid,
        cid: this.fixedCid
      })
      if (res.respcd === '0000') {
        if (!res.data.length) return
        if (res.data[0].status !== 2 && res.data[0].available === 1) {
          this.withdrawStatus = true
        }
      }
    },
    async getCidConfig() {
      let res = await Http.get('/solar/v1/mchnt/withdraw')
      if (res.respcd === '0000') {
        this.withdrawList = [...res.data]
        this.fixedCid = this.withdrawList[0]['code']
      }
    },
    async withdrawCtrl () {
      if (this.withdrawStatus) {
        // 关闭钱包
        let res = await Http.put(`/solar/v1/mchnt/withdraw`, {
          userid: this.mchntUid,
          cid: this.fixedCid
        })
        if (res.respcd === '0000') {
          this.operMoreDia = false
          this.$store.dispatch('setSnackbar', {
            showSnackbar: true,
            snackbarText: '钱包关闭成功',
            snackbarColor: 'success'
          })
        }
      } else {
        // 开通钱包
        let res = await Http.post(`/solar/v1/mchnt/withdraw`, {
          userid: this.mchntUid,
          cid: this.fixedCid
        })
        if (res.respcd === '0000') {
          this.operMoreDia = false
          this.$store.dispatch('setSnackbar', {
            showSnackbar: true,
            snackbarText: '钱包开通成功',
            snackbarColor: 'success'
          })
        }
      }
    },
    editbasicinfo() {
      this.editBaseDia = true
      this.fData = this.basicinfo
      this.fDict = {
        user_type: '商户类型',
        name: '签约实体',
        licensenumber: '营业执照号',
        legalperson: '法人代表',
        idnumber: '身份证',
        iddate: '身份证有效期',
        state: '商户状态'
      }
      this.fKeys = Object.keys(this.fDict)
      this.fRule = {
        user_type: [v => !!v || '请填写商户类型'],
        name: [v => !!v || '请填写签约实体'],
        legalperson: [v => !!v || '请填写法人代表'],
        state: [v => !!v || '请选择商户状态']
      }
    },
    async basicInfoEditSubmit () {
      if (this.basicinfo.iddate) {
        this.basicinfo.idstatdate = this.basicinfo.iddate[0]
        this.basicinfo.idenddate = this.basicinfo.iddate[1]
      }
      let submitObj = {}
      let oldObj = {}
      Object.keys(this.basicinfo).map(item => {
        if (this.basicinfo[item] !== JSON.parse(this.basicinfocache)[item]) {
          submitObj[item] = this.basicinfo[item]
          oldObj[item] = JSON.parse(this.basicinfocache)[item]
        }
      })
      if (!Object.keys(submitObj)) return
      submitObj.userid = this.mchntUid
      submitObj.oldvalue = JSON.stringify(oldObj)
      let res = await Http.put(`/solar/v1/mchnt/editbasicinfo`, submitObj)
      if (res.respcd === '0000') {
        this.basicinfo.user_type_name = this.USER_TYPE.find(item => item.id === this.basicinfo.user_type)['name']
        this.basicinfo.state_name = this.USER_STATE.find(item => item.id === this.basicinfo.state)['name']
        this.editBaseDia = false
        this.basicinfocache = JSON.stringify(this.basicinfo)
      }
    },
    basicInfoEditCancel () {
      this.basicinfo = JSON.parse(this.basicinfocache)
      this.editBaseDia = false
    },
    async editshopinfo() {
      this.fData = this.shopinfo
      this.fDict = {
        mobile: '手机号',
        telephone: '固定电话',
        email: '邮箱',
        nickname: '收据名称',
        province: '经营省份',
        city: '经营城市',
        district: '经营区县',
        address: '经营地址',
        mcc: '经营类型',
        ext_mcc: '海外mcc',
        short_name: '商户简称',
        website: '商户网址',
        groupid: '渠道id',
        business_uid: '业务员'
      }
      this.fKeys = Object.keys(this.fDict)
      this.fRule = {
        mobile: [v => !!v || '请填写手机号'],
        nickname: [v => !!v || '请填写收据名称'],
        district: [
          v => /^[a-zA-Z0-9\u2E80-\u9FFF]+$/g.test(v) || '请输入汉字、数字或字母',
          v => v.length <= 32 || '限制字符32个以内'
        ]
      }
      if (this.shopinfo.groupid) {
        await this.getSales()
      }
      this.editShopDia = true
    },
    async shopInfoEditSubmit() {
      let submitObj = {}
      let oldObj = {}
      Object.keys(this.shopinfo).map(item => {
        if (this.shopinfo[item] !== JSON.parse(this.shopinfocache)[item]) {
          submitObj[item] = this.shopinfo[item]
          oldObj[item] = JSON.parse(this.shopinfocache)[item]
        }
      })
      if (!Object.keys(submitObj)) return
      submitObj.userid = this.mchntUid
      if (!submitObj.userid) return
      submitObj.oldvalue = JSON.stringify(oldObj)
      let res = await Http.put(`/solar/v1/mchnt/editshopinfo`, submitObj)
      if (res.respcd === '0000') {
        this.editShopDia = false
        if (this.salesList.length && this.shopinfo.business_uid) {
          this.shopinfo.business_name = this.salesList.find(item => item.id === this.shopinfo.business_uid)['name']
        }
        this.shopinfocache = JSON.stringify(this.shopinfo)
      }
    },
    shopInfoEditCancel () {
      this.shopinfo = JSON.parse(this.shopinfocache)
      this.editShopDia = false
    },
    editproinfo() {
      this.editPro = true
    },
    viewSubDiv () {
      this.divDia = true
      this.getDivList()
      this.mchntdetailkeys = Object.keys(this.mchntdetaildict)
      this.operMoreDia = false
    },
    cancelDivDia (uid) {
      this.divDiaState = true
      this.divDiaMsg = '确认取消吗？'
    },
    closeDivDiaFun () {
      this.divDia = false
      this.divDiaState = false
      this.divDiaMsg = ''
      this.cancelAdd()
      this.cancelEdit()
    },
    cancelAddAlert () {
      this.addDiaState = true
      this.addDiaMsg = '确认取消吗？'
    },
    closeAddDiaFun () {
      this.addDiaState = false
      this.addDiaMsg = ''
      this.cancelAdd()
    },
    async getmchntinfo (uid) {
      let res = await Http.get(`/solar/v1/mchnt/divrule/mchinfo`, {
        userid: uid
      })
      if (res.respcd === '0000') {
        return res.data
      }
    },
    async appendmchntinfo (item) {
      if (!item.userid) return
      let res = await this.getmchntinfo(item.userid)
      if (res) {
        this.$set(item, 'details', res)
      }
    },
    async getDivList() {
      let res = await Http.get(`/solar/v1/mchnt/divrule/list`, {
        userid: this.mchntUid
      })
      if (res.respcd === '0000') {
        res = res.data
        this.divList = [...res]
        this.divList.map(item => {
          item.detail.map(_item => {
            if (_item.mchntid === item.fee_mchntid) {
              _item.feem = true
            } else {
              _item.feem = false
            }
          })
        })
      }
    },
    async addDiv () {
      if (this.editing) return
      let res = await this.getmchntinfo(this.mchntUid)
      if (res) {
        this.submitRule.userid = this.mchntUid
        this.ruledetailList[0].userid = this.mchntUid
        this.ruledetailList[0].details = res
        this.adding = true
        // 置空
        this.switchdisable = false
      }
    },
    addMchnt () {
      this.ruledetailList.push({
        userid: '', mchntid: '', percent: '', expand: false, feem: false, cancelable: 1
      })
    },
    addMchntForEdit (idx) {
      let list = JSON.parse(JSON.stringify(this.divList))
      list[idx]['detail'].push({
        userid: '', mchntid: '', percent: '', expand: false, feem: false, cancelable: 1
      })
      this.divList = JSON.parse(JSON.stringify(list))
    },
    deleRule (idx) {
      this.ruledetailList.splice(idx, 1)
    },
    deleRuleForEdit (idx, _idx) {
      this.divList[idx]['detail'].splice(_idx, 1)
    },
    editDivMchnt (item) {
      if (this.adding) return
      item.detail.map(async _item => {
        let res = await this.getmchntinfo(_item['userid'])
        if (res) {
          this.$set(_item, 'details', res)
          this.$set(_item, 'expand', false)
        }
      })
      this.editTempId = item.template_id
      this.feeMchntid = item.fee_mchntid
      this.editItem = JSON.stringify(item)
      this.editing = true
      // 置空
      this.switchdisable = true
    },
    async submit () {
      // add
      if (!this.$refs.addform.validate()) {
        return
      }
      if (!this.feeMchntid) {
        this.$store.dispatch('setSnackbar', {
          showSnackbar: true,
          snackbarText: '请选择分账手续支付商户',
          snackbarColor: 'error'
        })
      }
      let arr = []
      let sum = 0
      this.ruledetailList.map(item => {
        sum += Number(item.percent)
        arr.push({
          userid: Number(item.userid),
          mchntid: item.mchntid,
          percent: Number(item.percent)
        })
      })
      if (sum !== 100) {
        this.$store.dispatch('setSnackbar', {
          showSnackbar: true,
          snackbarText: '分账比例和需为100',
          snackbarColor: 'error'
        })
      }
      this.submitRule.mchntid = this.ruledetailList[0]['mchntid']
      this.submitRule.fee_mchntid = this.feeMchntid
      this.submitRule.detail = [...arr]
      let res = await Http.post(`/solar/v1/mchnt/divrule/info`, this.submitRule)
      if (res.respcd === '0000') {
        this.$store.dispatch('setSnackbar', {
          showSnackbar: true,
          snackbarText: '提交成功',
          snackbarColor: 'success'
        })
        this.cancelAdd()
        this.getDivList(this.mchntUid)
      }
    },
    async submitEdit (item) {
      // edit
      if (!this.$refs.addform[0].validate()) {
        return
      }
      let submitObj = {}
      submitObj.userid = item.userid
      submitObj.mchntid = item.detail[0]['mchntid']
      submitObj.template_id = item.template_id
      submitObj.fee_mchntid = this.feeMchntid
      submitObj.detail = []
      item.detail.map(item => {
        submitObj.detail.push({
          userid: Number(item.userid),
          percent: Number(item.percent),
          mchntid: item.mchntid
        })
      })
      let res = await Http.put(`/solar/v1/mchnt/divrule/info`, submitObj)
      if (res.respcd === '0000') {
        this.$store.dispatch('setSnackbar', {
          showSnackbar: true,
          snackbarText: '编辑成功',
          snackbarColor: 'success'
        })
        this.getDivList(this.mchntUid)
        this.cancelEdit()
      }
    },
    cancelAdd () {
      this.adding = false
      this.feeMchntid = ''
      Object.keys(this.submitRule).map(item => {
        this.submitRule[item] = ''
      })
      this.ruledetailList = JSON.parse(this.detailList)
    },
    cancelEditAlert () {
      this.editDiaMsg = '确认取消吗？'
      this.editDiaState = true
    },
    closeEditDiaFun () {
      this.editDiaState = false
      this.editDiaMsg = ''
      this.cancelEdit()
    },
    cancelEdit () {
      this.editing = false
      this.divList.map((item, index) => {
        if (item.template_id === this.editTempId) {
          this.divList[index] = JSON.parse(this.editItem)
        }
      })
    },
    expandDetail (item) {
      item.expand = !item.expand
    },
    async expandDetailWithList (item) {
      let res = await this.getmchntinfo(item['userid'])
      if (res) {
        this.$set(item, 'details', res)
        this.$set(item, 'expand', !item.expand)
      }
    },
    async exportMchnt() {
      const href = location.hostname === 'localhost' ? 'http://172.100.108.108:2990' : location.origin
      this.searchForm.cate_code = this.searchForm.cate_code ? this.searchForm.cate_code : ''
      if (!Object.values(this.searchForm).join('') && !this.queried) {
        return
      }
      this.$nextTick(() => {
        this.src = `${href}/solar/v1/mchnt/info?mode=expo_excel&groupname=${this.searchForm.groupname}&name=${this.searchForm.name}&userid=${this.searchForm.userid}&mobile=${this.searchForm.mobile}&nickname=${this.searchForm.nickname}&jointime_stime=${this.searchForm.jointime ? this.searchForm.jointime[0] : ''}&jointime_etime=${this.searchForm.jointime ? this.searchForm.jointime[1] : ''}&cate_code=${this.searchForm.cate_code}`
        let win = window.open()
        win.location = this.src
        this.ex_disable = true
      })
    },
    async voucherTypes() {
      let res = await Http.get(`/solar/v1/mchnt/vouchertypes`)
      if (res.respcd === '0000') {
        let voucherList = []
        Object.keys(res.data).map(item => {
          voucherList.push({
            id: item,
            name: res.data[item]
          })
        })
        this.voucherList = [...voucherList]
      }
    }
  },
  components: {
    Cotable,
    Infotemp,
    ConfirmTemp,
    FormTemp
  },
  created () {
    this.detailList = JSON.stringify(this.ruledetailList)
    this.getState()
    this.getTags()
    this.getUserType()
    this.getMccs()
    this.voucherTypes()
    this.getList()
  }
}
</script>
<style scoped lang="scss">
td{text-align: center;}
.f-wrap{
  display: flex;
  flex-wrap: wrap;
}
.t-f{
  padding: 8px;
}
.p-b-8{
  padding-bottom: 8px;
}
.d-v{
  background: #ffffff;min-height: 100vh;padding: 20px;
}
.d-h{
  display: flex;justify-content: space-between;background: #1867c0;color: #ffffff;padding: 5px 20px;
}
.d-h-f, .d-h-e{
  display: flex;font-size: 15px;
}
.d-h-i{
  padding: 6px;
  border-radius: 5px;
}
.d-h-i-active{
  background: rgba($color: #fff, $alpha: 0.9);color: #1867c0;
}
.b-i-h{
  font-size: 20px;display: flex;align-items: center;
}
.b-i-img{
  display: flex;flex-basis: 25%;flex-flow: column;padding: 20px;text-align: center;
}
.acc-h{
  padding: 10px 20px;background: #F5F5F5;
}
.acc-i-t{
  font-size: 20px;
}
.cn_name{
  font-size: 18px;
  line-height: 40px;
}
.img-w{
  position: relative;
}
.img-btn{
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
}
.b-i-w{
  padding: 15px 45px;
}
.tx-center{
  text-align: center;
}
.flex-tb{
  display: flex;justify-content: space-around;line-height: 45px;font-size: 16px;border-bottom: 1px solid rgba(0,0,0,0.1);
}
.below-row{
  display: flex;flex-wrap: wrap;justify-content: space-around;
}
.below-row div{
  width: 30%;
}
.c0, .c4, .c5{
  width: 10%;text-align: center;
}
.c1, .c3{
  width: 20%;text-align: center;padding: 0 10px;
}
.c2{
  width: 30%;text-align: center;
}
.c5{
  display: flex;
}
.temp-wrap{
  margin: 20px auto;
}
.v-form{
  margin: 20px auto;
}
.f-card{
  padding: 10px 50px;
}
.loading-bro {
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  background: rgba(0,0,0,0.5);
  overflow: hidden;
}
#load {
	width: 150px;
	animation: loading 3s linear infinite;
	#loading-inner {
		stroke: {
			dashoffset: 0;
			dasharray: 300;
			width: 10;
			miterlimit: 10;
			linecap: round;
		}
		animation: loading-circle 2s linear infinite;
		stroke: #fff;
		fill: transparent;
	}
}

@keyframes loading {
	0% {
		transform: rotate(0); 
	}
	100% {
		transform: rotate(360deg);
	}
}
@keyframes loading-circle {
	0% {
		stroke-dashoffset: 0
	}
	100% {
		stroke-dashoffset: -600;
	}
}
.apply-no-box{
  font-size: 15px;
}
#addImage {
  position: relative;
  border: 1px solid rgba(0,0,0,0.5);
  display: inline-block;
  input {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    cursor: pointer;
    opacity: 0;
  }
}
.img-w-inline{
  display: inline-block;position: relative;width: 200px;
}
.dele-img{
  position: absolute;top: 0;right: 0;
}
.o-card{
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 50px;
}
</style>
