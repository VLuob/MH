import { config, http } from '@utils'
import basic from '@base/system/basic'

const token = basic.token
const api = config.API_MEIHUA

export default {
  /**
   * 获取公开询价列表
   * @param option 
   */
  queryEnquirys(option={}) {
    return http.get(`${api}/composition/enquiry/list`, {...option})
  },

  /**
   * 获取公开询价详情
   * @param option 
   */
  queryEnquiry({enquiryId, ...option}) {
    return http.get(`${api}/composition/enquiry/${enquiryId}`, {...option})
  },

  /**
   * 获取公开询价编辑内容
   * @param option 
   */
  queryEnquiryEdit({enquiryId, ...option}) {
    return http.get(`${api}/composition/enquiry/detail/${enquiryId}`, {...option})
  },

  /**
   * 获取询价预览码
   * @param enquiryId 
   */
  queryEnquiryPreviewCode({enquiryId}) {
    return http.get(`${api}/composition/enquiry/preview_code/${enquiryId}`)
  },
  /**
   * 获取询价预览详情
   * @param option 
   */
  queryEnquiryPreview(option) {
    return http.get(`${api}/composition/enquiry/preview`, {token, ...option})
  },

  /**
   * 添加公开询价
   * @param option 
   */
  addEnquiry(option) {
    return http.post(`${api}/composition/enquiry`, {...option})
  },
  /**
   * 修改公开询价
   * @param option 
   */
  editEnquiry({enquiryId, ...option}) {
    return http.post(`${api}/composition/enquiry/${enquiryId}`, {...option})
  },

  /**
   * 删除公开询价
   * @param option 
   */
  deleteEnquiry({enquiryId, ...option}) {
    return http.post(`${api}/composition/enquiry/delete/${enquiryId}`, {...option})
  },

  /**
   * 批量发送询价
   * @param option 
   */
  betchSendEnquiry(option) {
    return http.post(`${api}/composition/enquiry/batch`, {token, ...option})
  },

  /**
   * 批量发送推荐创作者
   * @param option 
   */
  queryRecommendAuthors(option) {
    return http.get(`${api}/composition/enquiry/author/recommend`, option)
  },

  /**
   * 查看询价联系信息
   * @param option 
   */
  queryEnquiryContact({enquiryId, ...option}) {
    return http.get(`${api}/composition/enquiry/contact/${enquiryId}`, {token, ...option})
  },
  
  /**
   * 获取或生成询价对话id
   * @param option 
   */
  queryEnquiryChatId(option) {
    return http.post(`${api}/composition/enquiry/contact_online`, option)
  },

  /**
   * 获取相关推荐询价
   * @param option 
   */
  queryRecommendEnquirys({enquiryId, ...option}) {
    return http.get(`${api}/composition/enquiry/recommend/${enquiryId}`, option)
  },
}