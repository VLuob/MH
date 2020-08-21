import { config, http } from '@utils'
import basic from '@base/system/basic'

const token = basic.token
const api = config.API_MEIHUA

export default {
  /**
   * 获取私信列表
   * @param option 
   */
  queryLetters(option={}) {
    return http.get(`${api}/composition/person-private-messages`, {token, ...option})
  },

  /**
   * 获取私信对话详情
   * @param option 
   */
  queryLetterDetail(option) {
    return http.get(`${api}/composition/detail-messages`, {token, ...option})
  },

  /**
   * 查看用户与创作者私信记录
   * @param option 
   */
  queryLetterHistory(option) {
    return http.get(`${api}/composition/history-messages`, {token, ...option})
  },

  /**
   * 获取未读消息
   */
  queryUnreadLetters() {
    return http.get(`${api}/composition/unread-messages`, {token})
  },

  /**
   * 未读询价数量
   */
  queryUnreadEnquiryCount() {
    return http.get(`${api}/composition/enquiry/unread`, {token})
  },

  /**
   * 发送/回复私信
   * @param option 
   */
  sendLetter(option) {
    return http.post(`${api}/composition/private-message`, {token, ...option})
  },

  /**
   * 删除私信对话
   * @param option 
   */
  deleteLetter(option) {
    return http.post(`${api}/composition/detail-messages`, {token, ...option})
  },

  /**
   * 屏蔽
   * @param option 
   */
  shieldLetter(option) {
    return http.post(`${api}/composition/shield-message`, {token, ...option})
  },

  /**
   * 举报
   * @param option 
   */
  accusationLetter(option) {
    return http.post(`${api}/composition/accusation-message`, {token, ...option})
  },

  /**
   * 账户中心公开询价列表
   * @param option 
   */
  queryPublicEnquirys(option) {
    return http.get(`${api}/composition/user/enquiry`, {token, ...option})
  },
  /**
   * 账户中心公开询价状态
   * @param option 
   */
  queryPublicEnquiryStatus(option) {
    return http.get(`${api}/composition/user/enquiry_status`, {token, ...option})
  },
}