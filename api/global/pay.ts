import { config, http } from '@utils'
import basic from '@base/system/basic'

const api = config.API_MEIHUA
const token = basic.token

const appCode = 'c41d644656f84b779614f043aa64b208' // 梅花网appCode

export default {

  /**
   * 支付宝支付
   * @param  {Number} totalFee    支付金额
   * @param  {String} callback_url 支付成功后回调地址
   * @param  {string} scope        需要回调的参数
   * @param  {String} extendId     订单关联号
   * @param  {String} tradeNo     订单号 重新支付时候传
   */
  alipay(options) {
    const url = api + '/order/ali/pay'
    // const appCode = 'c41d644656f84b779614f043aa64b208' // 梅花网appCode
    const param = {token, appCode, ...options}
    const post = (URL, PARAMS) => {
        let temp = document.createElement("form");
        temp.action = URL;
        temp.method = "post";
        temp.style.display = "none";
        for (let x in PARAMS) {
            let opt = document.createElement("textarea");
            opt.name = x;
            opt.value = PARAMS[x];
            temp.appendChild(opt);
        }
        document.body.appendChild(temp);
        temp.submit();
        return temp;
    }
    return post(url, param)
  },

  /**
   * 微信支付
   * @param option 
   */
  wxpay(option) {
    return http.post(`${api}/order/wx/pay`, {token, appCode, ...option})
  },

  /**
   * 订单状态检查（微信）
   * @param option 
   */
  checkWxpayStatus(option) {
    return http.get(`${api}/order/wx/check_order_status`, {token, appCode, ...option})
  },

  /**
   * 银行转账
   * @param option 
   */
  unionpay(option) {
    return http.post(`${api}/order/bank/pay`, {token, appCode, ...option})
  },
  
}