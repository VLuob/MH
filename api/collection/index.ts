import { config, http } from '@utils'
import basic from '@base/system/basic'

const token = basic.token
const api = config.API_MEIHUA

export default {
  /**
   * 获取公开收藏夹列表
   * @param option 
   */
  queryPublicFavorites(option={}) {
    return http.get(`${api}/composition/collection/public-list`, {...option})
  },

  /**
   * 获取收藏夹详情
   * @param option 
   */
  queryFavoritesDetail({id, ...option}) {
    return http.get(`${api}/composition/collection/${id}`, {token, ...option})
  },

  /**
   * 获取收藏夹创作
   * @param option 
   */
  queryFavoritesCompositions({host, ...option}) {
    return http.get(`${api}/composition/collection/composition`, {token, ...option})
  },

  /**
   * 获取当前账号的收藏夹列表
   * @param param0 
   */
  queryCurrentFavorites(option) {
      return http.get(`${api}/composition/collection/collect-list`, {token, ...option})
  },

  /**
   * 新增收藏夹
   * @param option 
   */
  addFavorites(option) {
      return http.post(`${api}/composition/collection/add`, {token, ...option})
  },

  /**
   * 修改收藏夹
   * @param option 
   */
  editFavorites({id, ...option}) {
    return http.post(`${api}/composition/collection/${id}`, {token, ...option})
  },

    /**
     * 删除收藏夹
     * @param option 
     */
  deleteFavorites(option) {
    return http.post(`${api}/composition/collection/delete`, {token, ...option})
  },

  /**
   * 分享收藏夹
   * @param option 
   */
  shareFavorites(option) {
      return http.post(`${api}/composition/collection/share`, {token, ...option})
  },

  /**
   * 我的收藏夹
   * @param param0 
   */
  queryMyFavorites(option) {
      return http.get(`${api}/composition/author/setting/collections`, {token, ...option})
  },

  /**
   * 我关注的收藏夹
   * @param param0 
   */
  queryFollowFavorites(option) {
      return http.get(`${api}/composition/author/setting/follow-collection`, {token, ...option})
  },


  /**
   * 获取创造被收藏的收藏夹
   * @param param0 
   */
  queryCompositionFavorites(option) {
    return http.get(`${api}/composition/collection/composition/list`, option)
  }
}