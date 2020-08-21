import { config, http } from '@utils'
import basic from '@base/system/basic'

const token = basic.token
const api = config.API_MEIHUA

export default {
  /**
   * 个人中心获取用户创作者服务
   * @param option 
   */
  queryServices({authorId, ...option}) {
    return http.get(`${api}/composition/user/author_service/${authorId}`, {...option})
  },

  /**
   * 获取服务详情
   * @param option 
   */
  queryService({serviceId, ...option}) {
    return http.get(`${api}/composition/author/service/detail/${serviceId}`, {...option})
  },

  /**
   * 获取服务编辑内容
   * @param option 
   */
  queryServiceEdit({serviceId, ...option}) {
    return http.get(`${api}/composition/author_service/${serviceId}`, {...option})
  },

  /**
   * 获取服务预览代码
   * @param option 
   */
  queryServicePreviewCode({serviceId, ...option}) {
    return http.get(`${api}/composition/service/preview_code/${serviceId}`, {token, ...option})
  },
  /**
   * 获取服务预览内容
   * @param option 
   */
  queryServicePreview({previewCode, ...option}) {
    return http.get(`${api}/composition/author/service/preview/${previewCode}`, {...option})
  },

  /**
   * 添加服务
   * @param option 
   */
  addService(option) {
    return http.post(`${api}/composition/author_service/add`, {token, ...option})
  },
  /**
   * 修改服务
   * @param option 
   */
  editService({serviceId, ...option}) {
    return http.post(`${api}/composition/author_service/${serviceId}`, {token, ...option})
  },

  /**
   * 删除服务
   * @param option 
   */
  deleteService({...option}) {
    return http.post(`${api}/composition/author_service/delete`, {token, ...option})
  },

  /**
   * 个人中心我的服务获取创作者服务状态数据
   * @param option 
   */
  queryServiceStatus({authorId, ...option}) {
    return http.get(`${api}/composition/author_service/status/${authorId}`, {token, ...option})
  },

  /**
   * 获取服务状态
   * @param option 
   */
  queryServiceBrands({authorId, ...option}) {
    return http.get(`${api}/composition/service/brand/${authorId}`, {...option})
  },
  
  
  /**
   * 获取服务相关推荐
   * @param option 
   */
  queryRecommendServices({...option}) {
    return http.get(`${api}/composition/author/service/recommend`, {...option})
  },
  
  /**
   * 获取查看着的浏览记录
   * @param option 
   */
  queryViewHistoryServices({...option}) {
    return http.get(`${api}/composition/author/service/view_record`, {...option})
  },
  
  /**
   * 获取作品关联的创作者服务
   * @param param0 
   */
  queryCompositionServices({compositionId}) {
    return http.get(`${api}/composition/composition/author_service/${compositionId}`)
  },
  
  /**
   * 创作者主页获取关联服务
   * @param param0 
   */
  queryAuthorServices({code, ...option}) {
    return http.get(`${api}/composition/author/service/${code}`, {...option})
  },

}