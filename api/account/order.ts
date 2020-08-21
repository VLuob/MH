import { http } from '@utils'
import basic from '@base/system/basic'
import { config } from '@utils'

const api = config.API_MEIHUA
const token = basic.token
const appCode = basic.appCode


export default {
  /**
   * 升级版本
   * @param param0 
   */
  upgrade({host, authorId, ...option}) {
    return http.post(`${api}/composition/edition/${authorId}`, {token, ...option})
  },

  /**
   * 计算实际费用和到期时间
   * @param param0 
   */
  computedFee({host, authorId, ...option}) {
    return http.get(`${api}/composition/service/realfee/${authorId}`, {token, ...option})
  },
  
  
  /**
   * 预生成版本号
   * @param param0 
   */
  createOrderId({host, authorId, ...option}) {
    return http.post(`${api}/composition/edition/generate/${authorId}`, {token, ...option})
  },


  /**
   * 获取订单列表与套餐列表
   */
  queryOrders({host, ...option}) {
    return http.get(`${api}/composition/author/setting/edition`, {token, ...option})
  },

  /**
   * 取消订单
   * @param param0 
   */
  cancelOrder({tradeId}) {
    return http.post(`${api}/composition/author/setting/trade/cancel/${tradeId}`, {token})
  },

  /**
   * 获取发票设置详情
   */
  queryInvoice() {
    return http.get(`${api}/order/invoice/settings`, {token, appCode})
  },
  
  /**
   * 设置保存发票
   * @param option 
   */
  setInvoice({settingStr, ...option}) {
    return http.post(`${api}/order/invoice/setting`, {token, settingStr: JSON.stringify({appCode, ...settingStr}), ...option})
  },
  
  /**
   * 批量申请发票
   * @param option 
   */
  applyInvoice(option) {
    return http.post(`${api}/order/invoice/apply`, {token, appCode, ...option})
  },

  /**
   * 保存上传的付款凭证
   * @param param0 
   */
  savePaymentVoucher({tradeId, ...option}) {
    return http.post(`${api}//composition/author/setting/trade/voucher/${tradeId}`, {token, ...option})
  },

  
}