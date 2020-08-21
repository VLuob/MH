import { config, http } from '@utils'
import basic from '@base/system/basic'

// const srvutils = require('@utils/srvutils')

const token = basic.token
const api = config.API_MEIHUA

export default {
  /**
   * 获取所有未读消息数量
   * @param option 
   */
  queryMessageStat(option={}) {
    return http.get(`${api}/user/messages`, {token, ...option})
  },

  /**
   * 消息列表
   * @param option 
   */
  queryMessages(option) {
    return http.get(`${api}/composition/author/setting/messages`, {token, ...option})
  },

}